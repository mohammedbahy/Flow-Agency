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
import { DIRECTIONS, OFFSET_UNITS } from "../constants/deadline.js";

const BCRYPT_ROUNDS = 10;

process.env.JWT_SECRET ||= "test-secret-key";
process.env.JWT_EXPIRES_IN ||= "1h";

let mongoServer;
let server;
let baseUrl;

const request = async (method, path, { token, body } = {}) => {
  const headers = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};

const createUser = async ({
  name,
  email,
  role,
  password = "Pass12345@",
  status = "active",
  mustChangePassword = false,
}) => {
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return User.create({
    name,
    email,
    password: hash,
    role,
    status,
    mustChangePassword,
  });
};

const login = async (email, password) => {
  const { status, body } = await request("POST", "/api/v1/auth/login", {
    body: { email, password },
  });
  assert.equal(status, 200);
  return body.data.token;
};

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: "flow-agency-int" });
  const app = createApp();
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

test("admin creates user; employee forbidden; list search works", async () => {
  await mongoose.connection.db.dropDatabase();

  await createUser({
    name: "Admin",
    email: "admin@example.com",
    role: ROLES.ADMIN,
    password: "Admin12345@",
  });
  await createUser({
    name: "Emp",
    email: "emp@example.com",
    role: ROLES.EMPLOYEE,
    password: "Emp12345@",
  });

  const adminToken = await login("admin@example.com", "Admin12345@");
  const empToken = await login("emp@example.com", "Emp12345@");

  const created = await request("POST", "/api/v1/users", {
    token: adminToken,
    body: {
      name: "AM",
      email: "am@example.com",
      role: ROLES.ACCOUNT_MANAGER,
      password: "Am12345@",
    },
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.mustChangePassword, true);
  assert.equal(created.body.data.role, ROLES.ACCOUNT_MANAGER);

  const forbidden = await request("POST", "/api/v1/users", {
    token: empToken,
    body: {
      name: "X",
      email: "x@example.com",
      role: ROLES.EMPLOYEE,
      password: "Xx12345@",
    },
  });
  assert.equal(forbidden.status, 403);

  const list = await request("GET", "/api/v1/users?search=emp", {
    token: adminToken,
  });
  assert.equal(list.status, 200);
  assert.equal(list.body.pagination.total, 1);
  assert.equal(list.body.data[0].email, "emp@example.com");
});

test("role change bumps token version; last admin demotion blocked", async () => {
  await mongoose.connection.db.dropDatabase();

  const admin = await createUser({
    name: "Admin One",
    email: "a@example.com",
    role: ROLES.ADMIN,
    password: "A123456@",
  });
  const am = await createUser({
    name: "AM Two",
    email: "am2@example.com",
    role: ROLES.ACCOUNT_MANAGER,
    password: "Am212345@",
  });
  const adminToken = await login("a@example.com", "A123456@");

  const changed = await request("PATCH", `/api/v1/users/${am._id}/role`, {
    token: adminToken,
    body: { role: ROLES.EMPLOYEE },
  });
  assert.equal(changed.status, 200);
  assert.equal(changed.body.data.role, ROLES.EMPLOYEE);

  const blocked = await request("PATCH", `/api/v1/users/${admin._id}/role`, {
    token: adminToken,
    body: { role: ROLES.EMPLOYEE },
  });
  assert.equal(blocked.status, 409);
});

test("task auto-deadline and manual override preserved", async () => {
  await mongoose.connection.db.dropDatabase();

  await createUser({
    name: "Admin Two",
    email: "a2@example.com",
    role: ROLES.ADMIN,
    password: "A212345@",
  });
  const token = await login("a2@example.com", "A212345@");

  await DeadlineRule.create({
    taskType: "design",
    offsetValue: 3,
    offsetUnit: OFFSET_UNITS.DAYS,
    direction: DIRECTIONS.BEFORE,
    active: true,
  });

  const created = await request("POST", "/api/v1/tasks", {
    token,
    body: { taskType: "design", publishingDate: "2026-10-10T00:00:00.000Z" },
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.deadline, "2026-10-07T00:00:00.000Z");
  assert.equal(created.body.data.deadlineOverridden, false);
  const taskId = created.body.data.id;

  const manual = "2026-10-05T00:00:00.000Z";
  const overridden = await request("PATCH", `/api/v1/tasks/${taskId}`, {
    token,
    body: { deadline: manual },
  });
  assert.equal(overridden.status, 200);
  assert.equal(overridden.body.data.deadline, manual);
  assert.equal(overridden.body.data.deadlineOverridden, true);

  const moved = await request("PATCH", `/api/v1/tasks/${taskId}`, {
    token,
    body: { publishingDate: "2026-10-12T00:00:00.000Z" },
  });
  assert.equal(moved.status, 200);
  assert.equal(moved.body.data.deadline, manual);
  assert.equal(moved.body.data.deadlineOverridden, true);
});

test("completion rate and delayed-task aggregations", async () => {
  await mongoose.connection.db.dropDatabase();

  const DAY = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const past = (days) => new Date(now - days * DAY);

  await Task.create([
    {
      taskType: "design",
      status: COMPLETED_STATUS,
      publishingDate: past(5),
      deadline: past(7), // completed late -> excluded from delayed
    },
    {
      taskType: "content",
      status: TASK_STATUS.PENDING,
      publishingDate: past(4),
      deadline: past(3),
    },
    {
      taskType: "seo",
      status: TASK_STATUS.PENDING,
      publishingDate: past(3),
      deadline: past(1),
    },
    {
      taskType: "content",
      status: TASK_STATUS.PENDING,
      publishingDate: past(2),
      deadline: null, // no deadline -> excluded
    },
    {
      taskType: "design",
      status: TASK_STATUS.PENDING,
      publishingDate: past(2),
      deadline: past(6),
    },
  ]);

  const rate = await getCompletionRate({});
  assert.equal(rate.total, 5);
  assert.equal(rate.completed, 1);
  assert.equal(rate.notCompleted, 4);
  assert.equal(rate.rate, 0.2);

  const delayed = await getDelayedTasks({ page: 1, limit: 10 });
  assert.equal(delayed.pagination.total, 3);
  const days = delayed.items.map((item) => item.daysOverdue);
  // Sorted most-delayed first: 6, 3, 1.
  assert.deepEqual(days, [6, 3, 1]);
});
