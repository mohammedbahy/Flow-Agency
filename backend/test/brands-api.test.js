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
import TeamAssignment from "../models/team-assignment.js";
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

const createBrandAs = async (actor, overrides = {}) => {
  const response = await request("POST", "/brands", {
    actor,
    body: { name: "Nimbus Footwear", client: ids.clientOneId, ...overrides },
  });
  assert.equal(response.status, 201, response.text);
  return response.body.data;
};

const seedTask = async (overrides = {}) => {
  return Task.create({
    title: "Seeded task",
    status: "pending",
    client: ids.clientOneId,
    team: ids.teamOneId,
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
  const amTwo = await User.create({
    name: "Bob Manager",
    email: "am2@flow.test",
    password: "supersecret",
    role: "account_manager",
  });
  const employee = await User.create({
    name: "Eve Employee",
    email: "employee@flow.test",
    password: "supersecret",
    role: "employee",
  });
  const outsider = await User.create({
    name: "Omar Outsider",
    email: "outsider@flow.test",
    password: "supersecret",
    role: "employee",
  });

  const clientOne = await Client.create({
    name: "Aurora Media",
    accountManager: amOne._id,
    createdBy: admin._id,
  });
  const clientTwo = await Client.create({
    name: "Borealis Co",
    accountManager: amTwo._id,
    createdBy: admin._id,
  });
  const clientThree = await Client.create({
    name: "Cobalt Inc",
    createdBy: admin._id,
  });

  const teamOne = await Team.create({
    name: "Design & Motion",
    members: [employee._id],
    createdBy: admin._id,
  });
  const teamTwo = await Team.create({
    name: "Copywriting",
    members: [outsider._id],
    createdBy: admin._id,
  });

  await TeamAssignment.create({ client: clientOne._id, team: teamOne._id, assignedBy: admin._id });
  await TeamAssignment.create({ client: clientOne._id, team: teamTwo._id, assignedBy: admin._id });

  actors.admin = { _id: admin._id, role: "admin" };
  actors.amOne = { _id: amOne._id, role: "account_manager" };
  actors.amTwo = { _id: amTwo._id, role: "account_manager" };
  actors.employee = { _id: employee._id, role: "employee" };

  ids.adminId = String(admin._id);
  ids.amOneId = String(amOne._id);
  ids.amTwoId = String(amTwo._id);
  ids.employeeId = String(employee._id);
  ids.outsiderId = String(outsider._id);
  ids.clientOneId = String(clientOne._id);
  ids.clientTwoId = String(clientTwo._id);
  ids.clientThreeId = String(clientThree._id);
  ids.teamOneId = String(teamOne._id);
  ids.teamTwoId = String(teamTwo._id);

  const app = createApp({ identityMiddleware });
  const started = await startServer(app);
  server = started.instance;
  baseUrl = started.url;
});

beforeEach(async () => {
  await Brand.deleteMany({});
  await Task.deleteMany({});
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  await stopServer(server);
});

describe("POST /brands", () => {
  test("admin creates a brand with a populated client and server-managed createdBy", async () => {
    const brand = await createBrandAs("admin", { description: "Sportswear account" });

    assert.equal(brand.name, "Nimbus Footwear");
    assert.equal(brand.description, "Sportswear account");
    assert.equal(brand.status, "active");
    assert.equal(brand.createdBy, ids.adminId);
    assert.equal(brand.client.id, ids.clientOneId);
    assert.equal(brand.client.name, "Aurora Media");
  });

  test("admin can set status at creation", async () => {
    const brand = await createBrandAs("admin", { status: "inactive" });

    assert.equal(brand.status, "inactive");
  });

  test("client-supplied createdBy is rejected as an unknown field", async () => {
    const response = await request("POST", "/brands", {
      actor: "admin",
      body: { name: "Nimbus Footwear", client: ids.clientOneId, createdBy: ids.adminId },
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
    assert.equal(response.body.errors[0].field, "createdBy");
  });

  test("rejects a missing name", async () => {
    const response = await request("POST", "/brands", {
      actor: "admin",
      body: { client: ids.clientOneId },
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.errors[0].field, "name");
  });

  test("rejects names that are too short or too long", async () => {
    const short = await request("POST", "/brands", {
      actor: "admin",
      body: { name: "x", client: ids.clientOneId },
    });
    assert.equal(short.status, 400);
    assert.equal(short.body.errors[0].field, "name");

    const long = await request("POST", "/brands", {
      actor: "admin",
      body: { name: "a".repeat(101), client: ids.clientOneId },
    });
    assert.equal(long.status, 400);
    assert.equal(long.body.errors[0].field, "name");
  });

  test("rejects a missing or invalid client id", async () => {
    const missing = await request("POST", "/brands", {
      actor: "admin",
      body: { name: "Nimbus Footwear" },
    });
    assert.equal(missing.status, 400);
    assert.equal(missing.body.errors[0].field, "client");

    const invalid = await request("POST", "/brands", {
      actor: "admin",
      body: { name: "Nimbus Footwear", client: "not-an-id" },
    });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.errors[0].field, "client");
  });

  test("rejects a client that does not exist", async () => {
    const response = await request("POST", "/brands", {
      actor: "admin",
      body: {
        name: "Nimbus Footwear",
        client: String(new mongoose.Types.ObjectId()),
      },
    });

    assert.equal(response.status, 404);
    assert.equal(response.body.message, "Client not found");
  });

  test("rejects unknown fields", async () => {
    const response = await request("POST", "/brands", {
      actor: "admin",
      body: { name: "Nimbus Footwear", client: ids.clientOneId, logoUrl: "https://example.test/logo.png" },
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.errors[0].message, "Unknown field: logoUrl");
  });

  test("rejects an invalid status", async () => {
    const response = await request("POST", "/brands", {
      actor: "admin",
      body: { name: "Nimbus Footwear", client: ids.clientOneId, status: "archived" },
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.errors[0].field, "status");
  });

  test("rejects a second brand for the same client", async () => {
    await createBrandAs("admin");

    const response = await request("POST", "/brands", {
      actor: "admin",
      body: { name: "Duplicate Brand", client: ids.clientOneId },
    });

    assert.equal(response.status, 409);
    assert.equal(response.body.message, "A brand already exists for this client");
  });

  test("allows a brand for a different client", async () => {
    await createBrandAs("admin");

    const brand = await createBrandAs("admin", { name: "Borealis Brand", client: ids.clientTwoId });

    assert.equal(brand.client.id, ids.clientTwoId);
  });

  test("account manager cannot create a brand", async () => {
    const response = await request("POST", "/brands", {
      actor: "amOne",
      body: { name: "Nimbus Footwear", client: ids.clientOneId },
    });

    assert.equal(response.status, 403);
  });

  test("employee cannot create a brand", async () => {
    const response = await request("POST", "/brands", {
      actor: "employee",
      body: { name: "Nimbus Footwear", client: ids.clientOneId },
    });

    assert.equal(response.status, 403);
  });

  test("unauthenticated requests are rejected with 401", async () => {
    const response = await request("POST", "/brands", {
      body: { name: "Nimbus Footwear", client: ids.clientOneId },
    });

    assert.equal(response.status, 401);
  });
});

describe("GET /brands", () => {
  test("admin sees all brands with populated clients", async () => {
    await createBrandAs("admin");
    await createBrandAs("admin", { name: "Borealis Brand", client: ids.clientTwoId });

    const response = await request("GET", "/brands", { actor: "admin" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 2);
    assert.equal(response.body.pagination.total, 2);

    const names = response.body.data.map((brand) => brand.name);
    assert.ok(names.includes("Nimbus Footwear"));
    assert.ok(names.includes("Borealis Brand"));
    assert.ok(response.body.data.every((brand) => brand.client && brand.client.name));
  });

  test("search matches names case-insensitively and treats regex literally", async () => {
    await createBrandAs("admin", { name: "Nimbus (Sport) Co" });

    const match = await request("GET", "/brands?search=nimbus", { actor: "admin" });
    assert.equal(match.status, 200);
    assert.equal(match.body.data.length, 1);

    const literal = await request("GET", "/brands?search=(Sport", { actor: "admin" });
    assert.equal(literal.status, 200);
    assert.equal(literal.body.data.length, 1);

    const regexAttempt = await request("GET", "/brands?search=.*", { actor: "admin" });
    assert.equal(regexAttempt.status, 200);
    assert.equal(regexAttempt.body.data.length, 0);
  });

  test("filters by status and rejects an unknown status", async () => {
    await createBrandAs("admin");
    await createBrandAs("admin", { name: "Inactive Brand", client: ids.clientTwoId, status: "inactive" });

    const active = await request("GET", "/brands?status=active", { actor: "admin" });
    assert.equal(active.status, 200);
    assert.equal(active.body.data.length, 1);
    assert.equal(active.body.data[0].status, "active");

    const invalid = await request("GET", "/brands?status=archived", { actor: "admin" });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.errors[0].field, "status");
  });

  test("paginates with validated page and limit", async () => {
    await createBrandAs("admin", { name: "Brand Alpha" });
    await createBrandAs("admin", { name: "Brand Beta", client: ids.clientTwoId });
    await createBrandAs("admin", { name: "Brand Gamma", client: ids.clientThreeId });

    const pageOne = await request("GET", "/brands?search=Brand&limit=2&page=1", { actor: "admin" });
    assert.equal(pageOne.status, 200);
    assert.equal(pageOne.body.data.length, 2);
    assert.equal(pageOne.body.pagination.total, 3);
    assert.equal(pageOne.body.pagination.totalPages, 2);

    const pageTwo = await request("GET", "/brands?search=Brand&limit=2&page=2", { actor: "admin" });
    assert.equal(pageTwo.body.data.length, 1);
    assert.equal(pageTwo.body.pagination.page, 2);

    const oversizeLimit = await request("GET", "/brands?limit=101", { actor: "admin" });
    assert.equal(oversizeLimit.status, 400);

    const overflowPage = await request("GET", `/brands?page=${"9".repeat(400)}`, { actor: "admin" });
    assert.equal(overflowPage.status, 400);
  });

  test("account manager only sees brands of clients assigned to them", async () => {
    await createBrandAs("admin");
    await createBrandAs("admin", { name: "Borealis Brand", client: ids.clientTwoId });

    const response = await request("GET", "/brands", { actor: "amOne" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].client.id, ids.clientOneId);

    const foreignSearch = await request("GET", "/brands?search=Borealis", { actor: "amOne" });
    assert.equal(foreignSearch.status, 200);
    assert.deepEqual(foreignSearch.body.data, []);
    assert.equal(foreignSearch.body.pagination.total, 0);
  });

  test("employee cannot list brands", async () => {
    const response = await request("GET", "/brands", { actor: "employee" });

    assert.equal(response.status, 403);
  });

  test("unauthenticated requests are rejected with 401", async () => {
    const response = await request("GET", "/brands");

    assert.equal(response.status, 401);
  });
});

describe("GET /brands/:brandId/workflow", () => {
  test("admin sees associated teams and exact task counts grouped by status", async () => {
    const brand = await createBrandAs("admin");
    await seedTask({ title: "Pending 1" });
    await seedTask({ title: "Pending 2" });
    await seedTask({ title: "Active 1", status: "in_progress" });
    await seedTask({ title: "Done 1", status: "completed", completedAt: new Date() });
    await seedTask({ title: "Dropped 1", status: "cancelled" });

    const response = await request("GET", `/brands/${brand.id}/workflow`, { actor: "admin" });

    assert.equal(response.status, 200);
    const { data } = response.body;

    assert.equal(data.brand.id, brand.id);
    assert.equal(data.brand.name, "Nimbus Footwear");
    assert.equal(data.brand.client.id, ids.clientOneId);
    assert.equal(data.brand.client.name, "Aurora Media");

    assert.equal(data.workflow.totalTasks, 5);
    assert.deepEqual(data.workflow.byStatus, {
      pending: 2,
      in_progress: 1,
      completed: 1,
      cancelled: 1,
    });

    const teamIds = data.teams.map((team) => team.id);
    assert.equal(teamIds.length, 2);
    assert.ok(teamIds.includes(ids.teamOneId));
    assert.ok(teamIds.includes(ids.teamTwoId));

    const design = data.teams.find((team) => team.id === ids.teamOneId);
    assert.equal(design.name, "Design & Motion");
    assert.equal(design.memberCount, 1);
    assert.deepEqual(design.members, [{ id: ids.employeeId, name: "Eve Employee" }]);

    const copy = data.teams.find((team) => team.id === ids.teamTwoId);
    assert.equal(copy.name, "Copywriting");
    assert.equal(copy.memberCount, 1);
    assert.deepEqual(copy.members, [{ id: ids.outsiderId, name: "Omar Outsider" }]);
  });

  test("returns empty teams and zero counts for a brand with no teams or tasks", async () => {
    const brand = await createBrandAs("admin", { name: "Cobalt Brand", client: ids.clientThreeId });

    const response = await request("GET", `/brands/${brand.id}/workflow`, { actor: "admin" });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body.data.teams, []);
    assert.equal(response.body.data.workflow.totalTasks, 0);
    assert.deepEqual(response.body.data.workflow.byStatus, {
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    });
  });

  test("account manager can view workflow of their own client's brand", async () => {
    const brand = await createBrandAs("admin");

    const response = await request("GET", `/brands/${brand.id}/workflow`, { actor: "amOne" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.brand.id, brand.id);
  });

  test("account manager cannot view workflow of another manager's brand", async () => {
    const brand = await createBrandAs("admin", { name: "Borealis Brand", client: ids.clientTwoId });

    const response = await request("GET", `/brands/${brand.id}/workflow`, { actor: "amOne" });

    assert.equal(response.status, 403);
    assert.match(response.body.message, /clients assigned to them/);
  });

  test("employee cannot view workflow", async () => {
    const brand = await createBrandAs("admin");

    const response = await request("GET", `/brands/${brand.id}/workflow`, { actor: "employee" });

    assert.equal(response.status, 403);
  });

  test("unauthenticated requests are rejected with 401", async () => {
    const brand = await createBrandAs("admin");

    const response = await request("GET", `/brands/${brand.id}/workflow`);

    assert.equal(response.status, 401);
  });

  test("rejects an invalid brand id and a missing brand", async () => {
    const invalid = await request("GET", "/brands/not-an-id/workflow", { actor: "admin" });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.message, "Invalid brand id");

    const missing = await request(
      "GET",
      `/brands/${String(new mongoose.Types.ObjectId())}/workflow`,
      { actor: "admin" },
    );
    assert.equal(missing.status, 404);
    assert.equal(missing.body.message, "Brand not found");
  });
});

describe("GET /brands/:brandId/metrics", () => {
  test("completion rate excludes cancelled tasks from the denominator", async () => {
    const brand = await createBrandAs("admin");
    await seedTask({ title: "Done 1", status: "completed", completedAt: new Date() });
    await seedTask({ title: "Done 2", status: "completed", completedAt: new Date() });
    await seedTask({ title: "Active 1", status: "in_progress" });
    await seedTask({ title: "Dropped 1", status: "cancelled" });

    const response = await request("GET", `/brands/${brand.id}/metrics`, { actor: "admin" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.completionRate, 66.7);
  });

  test("completion rate is 100 when every eligible task is completed", async () => {
    const brand = await createBrandAs("admin");
    await seedTask({ title: "Done 1", status: "completed", completedAt: new Date() });
    await seedTask({ title: "Done 2", status: "completed", completedAt: new Date() });

    const response = await request("GET", `/brands/${brand.id}/metrics`, { actor: "admin" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.completionRate, 100);
  });

  test("completion rate is null when the denominator is zero", async () => {
    const brand = await createBrandAs("admin");
    await seedTask({ title: "Dropped 1", status: "cancelled" });

    const response = await request("GET", `/brands/${brand.id}/metrics`, { actor: "admin" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.completionRate, null);
  });

  test("average completion time averages completedAt minus createdAt over completed tasks", async () => {
    const brand = await createBrandAs("admin");
    const base = new Date("2026-01-01T00:00:00.000Z");
    await seedTask({
      title: "Fast",
      status: "completed",
      createdAt: base,
      completedAt: new Date(base.getTime() + 60_000),
    });
    await seedTask({
      title: "Slow",
      status: "completed",
      createdAt: base,
      completedAt: new Date(base.getTime() + 180_000),
    });
    await seedTask({ title: "Pending 1" });

    const response = await request("GET", `/brands/${brand.id}/metrics`, { actor: "admin" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.averageCompletionTimeMs, 120_000);
  });

  test("average completion time is null when no task has been completed", async () => {
    const brand = await createBrandAs("admin");
    await seedTask({ title: "Pending 1" });

    const response = await request("GET", `/brands/${brand.id}/metrics`, { actor: "admin" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.averageCompletionTimeMs, null);
  });

  test("a brand with no tasks returns null for both metrics", async () => {
    const brand = await createBrandAs("admin");

    const response = await request("GET", `/brands/${brand.id}/metrics`, { actor: "admin" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.completionRate, null);
    assert.equal(response.body.data.averageCompletionTimeMs, null);
  });

  test("metrics only consider tasks of the brand's client", async () => {
    const brand = await createBrandAs("admin");
    await seedTask({ title: "Done 1", status: "completed", completedAt: new Date() });
    await Task.create({
      title: "Foreign task",
      status: "completed",
      completedAt: new Date(),
      client: ids.clientTwoId,
      team: ids.teamTwoId,
      createdBy: ids.adminId,
    });

    const response = await request("GET", `/brands/${brand.id}/metrics`, { actor: "admin" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.completionRate, 100);
  });

  test("account manager cannot view metrics of another manager's brand", async () => {
    const brand = await createBrandAs("admin", { name: "Borealis Brand", client: ids.clientTwoId });

    const response = await request("GET", `/brands/${brand.id}/metrics`, { actor: "amOne" });

    assert.equal(response.status, 403);
  });

  test("account manager can view metrics of their own client's brand", async () => {
    const brand = await createBrandAs("admin");

    const response = await request("GET", `/brands/${brand.id}/metrics`, { actor: "amOne" });

    assert.equal(response.status, 200);
  });

  test("employee cannot view metrics", async () => {
    const brand = await createBrandAs("admin");

    const response = await request("GET", `/brands/${brand.id}/metrics`, { actor: "employee" });

    assert.equal(response.status, 403);
  });

  test("unauthenticated requests are rejected with 401", async () => {
    const brand = await createBrandAs("admin");

    const response = await request("GET", `/brands/${brand.id}/metrics`);

    assert.equal(response.status, 401);
  });

  test("rejects an invalid brand id and a missing brand", async () => {
    const invalid = await request("GET", "/brands/not-an-id/metrics", { actor: "admin" });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.message, "Invalid brand id");

    const missing = await request(
      "GET",
      `/brands/${String(new mongoose.Types.ObjectId())}/metrics`,
      { actor: "admin" },
    );
    assert.equal(missing.status, 404);
    assert.equal(missing.body.message, "Brand not found");
  });
});
