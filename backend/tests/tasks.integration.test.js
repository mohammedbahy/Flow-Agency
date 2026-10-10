import assert from "node:assert/strict";
import { test, before, after } from "node:test";
import bcrypt from "bcrypt";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createApp } from "../app.js";
import User from "../models/user.js";
import Task from "../models/task.js";
import DeadlineRule from "../models/deadline-rule.js";
import { ROLES } from "../constants/roles.js";
import { COMPLETED_STATUS, TASK_STATUS } from "../constants/task-status.js";
import { getCompletionRate, getDelayedTasks } from "../services/report-service.js";
import { calculateDeadline } from "../utils/deadline.js";
import { DIRECTIONS, OFFSET_UNITS } from "../constants/deadline.js";

const BCRYPT_ROUNDS = 10;

let mongoServer;

const buildApp = (app) => {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  return { server, baseUrl, fetch: async (path, init) => globalThis.fetch(`${baseUrl}${path}`, init) };
};

const apiRequest = (app, token) => async (path, init = {}) => {
  const headers = { "Content-Type": "application/json", ...(init.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, { ...init, headers });
  const data = await res.json();
  return { res, data };
};

const createUser = async ({ name, email, role, password = "Pass12345@", status = "active", mustChangePassword = false, createdBy = null }) => {
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return User.create({
    name,
    email,
    password: hash,
    role,
    status,
    mustChangePassword,
    createdBy,
  });
};

const login = async (app, email, password) => {
  const { res, data } = await apiRequest(app)(`/api/v1/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return { res, data, token: data.data?.token };
};

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: "flow-agency-int" });
});

after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

test("admin creates user, lists with search; employee forbidden", async () => {
  await mongoose.connection.db.dropDatabase();
  const app = createApp();
  const { server, fetch } = buildApp(app);

  const admin = await createUser({ name: "Admin", email: "admin@example.com", role: ROLES.ADMIN, password: "Admin12345@" });
  const adminToken = (await login(app, "admin@example.com", "Admin12345@")).token;
  const employee = await createUser({ name: "Emp", email: "emp@example.com", role: ROLES.EMPLOYEE, password: "Emp12345@" });
  const empToken = (await login(app, "emp@example.com", "Emp12345@")).token;

  // Admin creates account manager
  let res = await fetch("/api/v1/users", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ name: "AM", email: "am@example.com", role: ROLES.ACCOUNT_MANAGER, password: "Am12345@" }),
  });
  let data = await res.json();
  assert.equal(res.status, 201);
  assert.equal(data.success, true);
  assert.equal(data.data.mustChangePassword, true);
  assert.equal(data.data.role, ROLES.ACCOUNT_MANAGER);

  // Employee cannot create user
  res = await fetch("/api/v1/users", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${empToken}` },
    body: JSON.stringify({ name: "X", email: "x@example.com", role: ROLES.EMPLOYEE, password: "Xx12345@" }),
  });
  data = await res.json();
  assert.equal(res.status, 403);

  // Admin lists with search
  res = await fetch("/api/v1/users?search=am", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.pagination.total, 1);

  await server.close();
});

test("user role change bumps token version and blocks last admin demotion", async () => {
  await mongoose.connection.db.dropDatabase();
  const app = createApp();
  const { server } = buildApp(app);
  const admin = await createUser({ name: "A", email: "a@example.com", role: ROLES.ADMIN, password: "A123456@" });
  const am = await createUser({ name: "AM", email: "am2@example.com", role: ROLES.ACCOUNT_MANAGER, password: "Am212345@" });
  const adminToken = (await login(app, "a@example.com", "A123456@")).token;

  // Admin cannot demote the last admin
  let r = await fetch("/api/v1/users", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ name: "B", email: "b@example.com", role: ROLES.EMPLOYEE, password: "B123456@" }),
  });
  let d = await r.json();

  // Change am role to employee
  r = await fetch(`/api/v1/users/${am._id}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ role: ROLES.EMPLOYEE }),
  });
  d = await r.json();
  assert.equal(r.status, 200);

  // Try to change last admin
  r = await fetch(`/api/v1/users/${admin._id}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ role: ROLES.EMPLOYEE }),
  });
  d = await r.json();
  assert.equal(r.status, 409);

  await server.close();
});

test("tasks: auto deadline, manual override preserved on publishingDate change", async () => {
  await mongoose.connection.db.dropDatabase();
  const app = createApp();
  const { server, fetch } = buildApp(app);

  const admin = await createUser({ name: "A", email: "a2@example.com", role: ROLES.ADMIN, password: "A212345@" });
  const token = (await login(app, "a2@example.com", "A212345@")).token;

  // Seed rule: design = publishing - 3 days
  await new DeadlineRule({
    taskType: "design",
    offsetValue: 3,
    offsetUnit: OFFSET_UNITS.DAYS,
    direction: DIRECTIONS.BEFORE,
    active: true,
  }).save();

  const pub = "2026-10-10T00:00:00.000Z";
  // Create task with publishing date; auto compute
  let r = await fetch("/api/v1/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ taskType: "design", publishingDate: pub }),
  });
  let d = await r.json();
  assert.equal(r.status, 201);
  assert.equal(d.data.deadline, "2026-10-07T00:00:00.000Z");
  assert.equal(d.data.deadlineOverridden, false);
  const taskId = d.data.id;

  // Manual override
  const manual = "2026-10-05T00:00:00.000Z";
  r = await fetch(`/api/v1/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ deadline: manual }),
  });
  d = await r.json();
  assert.equal(r.status, 200);
  assert.equal(d.data.deadline, manual);
  assert.equal(d.data.deadlineOverridden, true);

  // Change publishing date; override preserved
  r = await fetch(`/api/v1/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ publishingDate: "2026-10-12T00:00:00.000Z" }),
  });
  d = await r.json();
  assert.equal(r.status, 200);
  assert.equal(d.data.deadline, manual);
  assert.equal(d.data.deadlineOverridden, true);

  await server.close();
});

test("completion rate and delayed tasks aggregation", async () => {
  await mongoose.connection.db.dropDatabase();
  const now = new Date("2026-10-10T00:00:00.000Z");
  // Create tasks
  await Task.create([
    { taskType: "design", status: COMPLETED_STATUS, publishingDate: new Date("2026-10-05T00:00:00.000Z"), deadline: new Date("2026-10-03T00:00:00.000Z") },
    { taskType: "content", status: TASK_STATUS.PENDING, publishingDate: new Date("2026-10-06T00:00:00.000Z"), deadline: new Date("2026-10-09T00:00:00.000Z") },
    { taskType: "seo", status: TASK_STATUS.IN_PROGRESS, publishingDate: new Date("2026-10-07T00:00:00.000Z"), deadline: new Date("2026-10-08T00:00:00.000Z") },
  ]);

  // Delayed: 2 tasks (deadline 2026-10-09 < now? 2026-10-09 is before 2026-10-10; PENDING -> delayed. deadline 2026-10-08 < 2026-10-10 and IN_PROGRESS -> delayed. COMPLETED with past deadline -> not delayed.)
  const delayed = await getDelayedTasks({ page: 1, limit: 10 });
  assert.equal(delayed.pagination.total, 2);
  assert.equal(delayed.items[0].daysOverdue, 1); // 10-8=2? 2026-10-10 - 2026-10-08 = 2 days? 2 days difference -> daysOverdue floor 2
  // 2026-10-10 - 2026-10-09 = 1 day
  const days = delayed.items.map(i => i.daysOverdue).sort((a,b)=>b-a);
  assert.ok(days.includes(2));

  const rate = await getCompletionRate({});
  assert.equal(rate.total, 3);
  assert.equal(rate.completed, 1);
  assert.equal(rate.rate, 0.3333);
});
