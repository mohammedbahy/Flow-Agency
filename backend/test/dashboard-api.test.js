import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, beforeEach, describe, test } from "node:test";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import createApp from "../app.js";
import Brand from "../models/brand.js";
import Client from "../models/client.js";
import Task from "../models/task.js";
import Team from "../models/team.js";
import User from "../models/user.js";

let mongoServer;
let server;
let baseUrl;

const actors = {};
const ids = {};

const identityMiddleware = (req, res, next) => {
  const actorKey = req.headers["x-test-actor"];
  const actor = actorKey ? actors[actorKey] : undefined;
  if (actor) {
    req.user = { _id: actor._id, role: actor.role };
  }
  next();
};

const request = async (method, path, options = {}) => {
  const { actor, body } = options;
  const headers = {};
  let payload;

  if (actor) {
    headers["x-test-actor"] = actor;
  }

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${baseUrl}${path}`, { method, headers, body: payload });
  const text = await response.text();

  return {
    status: response.status,
    body: text ? JSON.parse(text) : null,
    text,
  };
};

const startServer = async (app) => {
  const instance = app.listen(0);
  await once(instance, "listening");
  return { instance, url: `http://127.0.0.1:${instance.address().port}/api/v1` };
};

const stopServer = async (instance) => {
  instance.closeIdleConnections();
  await new Promise((resolve) => instance.close(resolve));
};

const seedTask = async (overrides = {}) => {
  return Task.create({
    title: "Seeded task",
    status: "pending",
    client: ids.clientActiveOneId,
    team: ids.teamActiveId,
    createdBy: ids.adminId,
    ...overrides,
  });
};

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const admin = await User.create({
    name: "Ada Admin",
    email: "admin@flow.test",
    password: "supersecret",
    role: "admin",
  });
  const amOne = await User.create({
    name: "Anna Manager",
    email: "am1@flow.test",
    password: "supersecret",
    role: "account_manager",
  });
  const employee = await User.create({
    name: "Eve Employee",
    email: "employee@flow.test",
    password: "supersecret",
    role: "employee",
  });

  const clientActiveOne = await Client.create({
    name: "Aurora Media",
    createdBy: admin._id,
  });
  const clientActiveTwo = await Client.create({
    name: "Borealis Co",
    createdBy: admin._id,
  });
  const clientInactive = await Client.create({
    name: "Cobalt Inc",
    status: "inactive",
    createdBy: admin._id,
  });

  const teamActive = await Team.create({
    name: "Design & Motion",
    members: [employee._id],
    createdBy: admin._id,
  });
  const teamInactive = await Team.create({
    name: "Copywriting",
    status: "inactive",
    createdBy: admin._id,
  });
  const teamEmpty = await Team.create({
    name: "Strategy",
    createdBy: admin._id,
  });

  actors.admin = { _id: admin._id, role: "admin" };
  actors.amOne = { _id: amOne._id, role: "account_manager" };
  actors.employee = { _id: employee._id, role: "employee" };

  ids.adminId = String(admin._id);
  ids.amOneId = String(amOne._id);
  ids.employeeId = String(employee._id);
  ids.clientActiveOneId = String(clientActiveOne._id);
  ids.clientActiveTwoId = String(clientActiveTwo._id);
  ids.clientInactiveId = String(clientInactive._id);
  ids.teamActiveId = String(teamActive._id);
  ids.teamInactiveId = String(teamInactive._id);
  ids.teamEmptyId = String(teamEmpty._id);

  const app = createApp({ identityMiddleware });
  const started = await startServer(app);
  server = started.instance;
  baseUrl = started.url;
});

beforeEach(async () => {
  await Task.deleteMany({});
  await Brand.deleteMany({});
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  await stopServer(server);
});

describe("GET /dashboard", () => {
  test("admin sees exact agency-wide totals and metrics", async () => {
    await seedTask({ title: "Pending 1" });
    await seedTask({ title: "Pending 2" });
    await seedTask({ title: "Active 1", status: "in_progress" });
    const base = new Date("2026-01-01T00:00:00.000Z");
    await seedTask({
      title: "Fast",
      status: "completed",
      team: ids.teamInactiveId,
      createdAt: base,
      completedAt: new Date(base.getTime() + 60_000),
    });
    await seedTask({
      title: "Slow",
      status: "completed",
      createdAt: base,
      completedAt: new Date(base.getTime() + 180_000),
    });
    await seedTask({ title: "Dropped 1", status: "cancelled" });

    await Brand.create({ name: "Nimbus Footwear", client: ids.clientActiveOneId, createdBy: ids.adminId });
    await Brand.create({
      name: "Dormant Brand",
      client: ids.clientActiveTwoId,
      status: "inactive",
      createdBy: ids.adminId,
    });

    const response = await request("GET", "/dashboard", { actor: "admin" });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);

    const { data } = response.body;

    assert.deepEqual(data.clients, { total: 3, active: 2, inactive: 1 });

    assert.equal(data.tasks.total, 6);
    assert.deepEqual(data.tasks.byStatus, {
      pending: 2,
      in_progress: 1,
      completed: 2,
      cancelled: 1,
    });
    assert.equal(data.tasks.completionRate, 40);
    assert.equal(data.tasks.averageCompletionTimeMs, 120_000);

    assert.equal(data.teams.total, 3);
    assert.equal(data.teams.active, 2);
    assert.deepEqual(data.teams.byTeam, [
      { id: ids.teamActiveId, name: "Design & Motion", taskCount: 5 },
      { id: ids.teamInactiveId, name: "Copywriting", taskCount: 1 },
      { id: ids.teamEmptyId, name: "Strategy", taskCount: 0 },
    ]);

    assert.deepEqual(data.brands, { total: 2, active: 1, inactive: 1 });
  });

  test("completion rate is null when the denominator is zero", async () => {
    await seedTask({ title: "Dropped 1", status: "cancelled" });

    const response = await request("GET", "/dashboard", { actor: "admin" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.tasks.byStatus.cancelled, 1);
    assert.equal(response.body.data.tasks.completionRate, null);
    assert.equal(response.body.data.tasks.averageCompletionTimeMs, null);
  });

  test("average completion time only uses completed tasks with valid timestamps", async () => {
    const base = new Date("2026-01-01T00:00:00.000Z");
    await seedTask({
      title: "Timed",
      status: "completed",
      createdAt: base,
      completedAt: new Date(base.getTime() + 90_000),
    });
    await seedTask({ title: "Untimed", status: "completed", completedAt: null });

    const response = await request("GET", "/dashboard", { actor: "admin" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.tasks.completionRate, 100);
    assert.equal(response.body.data.tasks.averageCompletionTimeMs, 90_000);
  });

  test("returns zero counts and null metrics for empty collections", async () => {
    const response = await request("GET", "/dashboard", { actor: "admin" });

    assert.equal(response.status, 200);
    const { data } = response.body;

    assert.equal(data.tasks.total, 0);
    assert.deepEqual(data.tasks.byStatus, {
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    });
    assert.equal(data.tasks.completionRate, null);
    assert.equal(data.tasks.averageCompletionTimeMs, null);

    assert.deepEqual(data.brands, { total: 0, active: 0, inactive: 0 });

    assert.deepEqual(data.clients, { total: 3, active: 2, inactive: 1 });
    assert.equal(data.teams.total, 3);
  });

  test("account manager and employee receive 403", async () => {
    const asManager = await request("GET", "/dashboard", { actor: "amOne" });
    assert.equal(asManager.status, 403);
    assert.equal(asManager.body.success, false);

    const asEmployee = await request("GET", "/dashboard", { actor: "employee" });
    assert.equal(asEmployee.status, 403);
    assert.equal(asEmployee.body.success, false);
  });

  test("unauthenticated requests receive 401", async () => {
    const response = await request("GET", "/dashboard");

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
  });

  test("database errors surface as a 500 envelope", async () => {
    const originalAggregate = Task.aggregate;
    Task.aggregate = async () => {
      throw new Error("connection lost");
    };

    try {
      const response = await request("GET", "/dashboard", { actor: "admin" });

      assert.equal(response.status, 500);
      assert.equal(response.body.success, false);
      assert.equal(response.body.message, "Internal server error");
    } finally {
      Task.aggregate = originalAggregate;
    }
  });
});
