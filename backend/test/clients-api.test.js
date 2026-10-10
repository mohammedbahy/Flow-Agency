import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, beforeEach, describe, test } from "node:test";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import createApp from "../app.js";
import Client from "../models/client.js";
import Team from "../models/team.js";
import TeamAssignment from "../models/team-assignment.js";
import User from "../models/user.js";

let mongoServer;
let server;
let baseUrl;

const actors = {};
const ids = {};
const fixtures = {};

const identityMiddleware = (req, res, next) => {
  const actorKey = req.headers["x-test-actor"];
  const actor = actorKey ? actors[actorKey] : undefined;
  if (actor) {
    req.user = { _id: actor._id, role: actor.role };
  }
  next();
};

const request = async (method, path, options = {}) => {
  const { actor, body, rawBody } = options;
  const headers = {};
  let payload;

  if (actor) {
    headers["x-test-actor"] = actor;
  }

  if (rawBody !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = rawBody;
  } else if (body !== undefined) {
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

const createClientAs = async (actor, overrides = {}) => {
  const response = await request("POST", "/clients", {
    actor,
    body: { name: "Aurora Media", ...overrides },
  });
  assert.equal(response.status, 201, response.text);
  return response.body.data;
};

const assignTeamAsAdmin = async (clientId, teamId) => {
  const response = await request("POST", `/clients/${clientId}/teams`, {
    actor: "admin",
    body: { teamId },
  });
  assert.equal(response.status, 201, response.text);
  return response.body.data;
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

  actors.admin = { _id: admin._id, role: "admin" };
  actors.amOne = { _id: amOne._id, role: "account_manager" };
  actors.amTwo = { _id: amTwo._id, role: "account_manager" };
  actors.employee = { _id: employee._id, role: "employee" };

  ids.adminId = String(admin._id);
  ids.amOneId = String(amOne._id);
  ids.amTwoId = String(amTwo._id);

  const teamOne = await Team.create({
    name: "Creative Studio",
    members: [amOne._id, employee._id],
    createdBy: admin._id,
  });
  const teamTwo = await Team.create({ name: "Media Buying", createdBy: admin._id });

  fixtures.teamOneId = String(teamOne._id);
  fixtures.teamTwoId = String(teamTwo._id);

  await Promise.all([User.init(), Client.init(), Team.init(), TeamAssignment.init()]);

  const started = await startServer(createApp({ identityMiddleware }));
  server = started.instance;
  baseUrl = started.url;
});

beforeEach(async () => {
  await Promise.all([Client.deleteMany({}), TeamAssignment.deleteMany({})]);
});

after(async () => {
  if (server) {
    await stopServer(server);
  }
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("fail-closed protection seam", () => {
  test("guarded routes return 401 when no identity middleware is mounted", async () => {
    const bare = await startServer(createApp());
    try {
      const response = await fetch(`${bare.url}/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Acme" }),
      });
      const body = await response.json();

      assert.equal(response.status, 401);
      assert.equal(body.success, false);
    } finally {
      await stopServer(bare.instance);
    }
  });

  test("guarded routes return 401 for an unauthenticated request", async () => {
    const response = await request("GET", "/clients");
    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
    assert.equal(response.body.message, "Authentication required");
  });

  test("health endpoint stays public", async () => {
    const response = await request("GET", "/health");
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { success: true, message: "Backend is running successfully" });
  });
});

describe("FLW-18 — create client", () => {
  test("creates a client and derives audit fields from the authenticated identity", async () => {
    const response = await request("POST", "/clients", {
      actor: "admin",
      body: {
        name: "  Aurora Media ",
        description: "Full-service agency",
        email: "Hello@Example.COM",
        phone: "+1 555 0100",
        accountManager: ids.amOneId,
      },
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);
    assert.equal(response.body.message, "Client created successfully");

    const client = response.body.data;
    assert.equal(client.name, "Aurora Media");
    assert.equal(client.email, "hello@example.com");
    assert.equal(client.status, "active");
    assert.equal(client.createdBy, ids.adminId);
    assert.deepEqual(client.accountManager, {
      id: ids.amOneId,
      name: "Anna Manager",
      email: "am1@flow.test",
      role: "account_manager",
    });
    assert.ok(!Number.isNaN(Date.parse(client.createdAt)));

    const stored = await Client.findById(client.id).lean();
    assert.equal(String(stored.createdBy), ids.adminId);
  });

  test("never exposes password or other sensitive fields", async () => {
    const client = await createClientAs("admin", { accountManager: ids.amOneId });
    const response = await request("GET", `/clients/${client.id}`, { actor: "admin" });

    assert.equal(response.status, 200);
    assert.ok(!response.text.includes("password"));
    assert.ok(!response.text.includes("supersecret"));
  });

  test("rejects a client-supplied createdBy and other unknown fields", async () => {
    const response = await request("POST", "/clients", {
      actor: "admin",
      body: { name: "Acme", createdBy: ids.amTwoId },
    });

    assert.equal(response.status, 400);
    assert.ok(response.body.errors.some((entry) => entry.field === "createdBy"));
    assert.equal(await Client.countDocuments(), 0);
  });

  test("applies defaults for a minimal payload", async () => {
    const client = await createClientAs("admin");

    assert.equal(client.status, "active");
    assert.equal(client.accountManager, null);
    assert.equal(client.description, null);
  });

  test("validates required fields and input formats", async () => {
    const missingName = await request("POST", "/clients", { actor: "admin", body: {} });
    assert.equal(missingName.status, 400);
    assert.ok(missingName.body.errors.some((entry) => entry.field === "name"));

    const badEmail = await request("POST", "/clients", {
      actor: "admin",
      body: { name: "Acme", email: "not-an-email" },
    });
    assert.equal(badEmail.status, 400);
    assert.ok(badEmail.body.errors.some((entry) => entry.field === "email"));

    const badStatus = await request("POST", "/clients", {
      actor: "admin",
      body: { name: "Acme", status: "archived" },
    });
    assert.equal(badStatus.status, 400);
    assert.ok(badStatus.body.errors.some((entry) => entry.field === "status"));
  });

  test("requires accountManager to reference an existing account manager", async () => {
    const foreign = await request("POST", "/clients", {
      actor: "admin",
      body: { name: "Acme", accountManager: "507f1f77bcf86cd799439011" },
    });
    assert.equal(foreign.status, 400);
    assert.ok(foreign.body.errors.some((entry) => entry.field === "accountManager"));

    const wrongRole = await request("POST", "/clients", {
      actor: "admin",
      body: { name: "Acme", accountManager: ids.adminId },
    });
    assert.equal(wrongRole.status, 400);
    assert.ok(wrongRole.body.errors.some((entry) => entry.field === "accountManager"));
  });

  test("rejects malformed JSON with 400", async () => {
    const response = await request("POST", "/clients", { actor: "admin", rawBody: '{ "name": ' });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "Invalid JSON payload");
  });

  test("rejects payloads over the JSON body limit with 413", async () => {
    const response = await request("POST", "/clients", {
      actor: "admin",
      rawBody: JSON.stringify({ name: "Acme", notes: "x".repeat(110 * 1024) }),
    });

    assert.equal(response.status, 413);
    assert.equal(response.body.success, false);
    assert.equal(response.body.message, "Payload too large");
  });

  test("denies non-admin roles", async () => {
    for (const actor of ["amOne", "employee"]) {
      const response = await request("POST", "/clients", {
        actor,
        body: { name: `Client by ${actor}` },
      });
      assert.equal(response.status, 403, `expected 403 for ${actor}`);
      assert.equal(response.body.success, false);
    }
  });
});

describe("FLW-18 — list clients", () => {
  test("returns the response envelope with pagination metadata", async () => {
    await createClientAs("admin");
    await createClientAs("admin", { name: "Borealis Group" });

    const response = await request("GET", "/clients", { actor: "admin" });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.length, 2);
    assert.deepEqual(response.body.pagination, { page: 1, limit: 10, total: 2, totalPages: 1 });
  });

  test("filters by search term across name and email (case-insensitive)", async () => {
    await createClientAs("admin", { name: "Aurora Media" });
    await createClientAs("admin", { name: "Borealis Group", email: "aurora@b2b.test" });
    await createClientAs("admin", { name: "Cinder Labs" });

    const byName = await request("GET", "/clients?search=AURORA", { actor: "admin" });
    assert.equal(byName.body.pagination.total, 2);

    const byEmail = await request("GET", "/clients?search=aurora@", { actor: "admin" });
    assert.equal(byEmail.body.pagination.total, 1);
    assert.equal(byEmail.body.data[0].name, "Borealis Group");
  });

  test("filters by status and account manager", async () => {
    await createClientAs("admin", { name: "Active One", accountManager: ids.amOneId });
    await createClientAs("admin", { name: "Paused One", status: "inactive" });

    const inactive = await request("GET", "/clients?status=inactive", { actor: "admin" });
    assert.equal(inactive.body.pagination.total, 1);
    assert.equal(inactive.body.data[0].name, "Paused One");

    const managed = await request("GET", `/clients?accountManager=${ids.amOneId}`, { actor: "admin" });
    assert.equal(managed.body.pagination.total, 1);
    assert.equal(managed.body.data[0].name, "Active One");
  });

  test("paginates results", async () => {
    await createClientAs("admin", { name: "Client One" });
    await createClientAs("admin", { name: "Client Two" });
    await createClientAs("admin", { name: "Client Three" });

    const firstPage = await request("GET", "/clients?page=1&limit=2", { actor: "admin" });
    assert.equal(firstPage.body.data.length, 2);
    assert.deepEqual(firstPage.body.pagination, { page: 1, limit: 2, total: 3, totalPages: 2 });

    const secondPage = await request("GET", "/clients?page=2&limit=2", { actor: "admin" });
    assert.equal(secondPage.body.data.length, 1);
  });

  test("rejects invalid query parameters", async () => {
    const unknown = await request("GET", "/clients?sort=name", { actor: "admin" });
    assert.equal(unknown.status, 400);

    const badPage = await request("GET", "/clients?page=0", { actor: "admin" });
    assert.equal(badPage.status, 400);

    const badStatus = await request("GET", "/clients?status=bogus", { actor: "admin" });
    assert.equal(badStatus.status, 400);
  });

  test("rejects out-of-range page values instead of echoing them", async () => {
    const overflow = await request("GET", `/clients?page=${"9".repeat(400)}`, { actor: "admin" });
    assert.equal(overflow.status, 400);
    assert.ok(overflow.body.errors.some((entry) => entry.field === "page"));
  });

  test("treats the search term literally (no regex injection)", async () => {
    await createClientAs("admin", { name: "Aurora (EMEA) Media" });
    await createClientAs("admin", { name: "Borealis Group" });

    const wildcard = await request("GET", "/clients?search=.*", { actor: "admin" });
    assert.equal(wildcard.status, 200);
    assert.equal(wildcard.body.pagination.total, 0);

    const literal = await request("GET", `/clients?search=${encodeURIComponent("aurora (emea")}`, {
      actor: "admin",
    });
    assert.equal(literal.body.pagination.total, 1);
    assert.equal(literal.body.data[0].name, "Aurora (EMEA) Media");
  });

  test("denies non-admin roles", async () => {
    for (const actor of ["amOne", "employee"]) {
      const response = await request("GET", "/clients", { actor });
      assert.equal(response.status, 403, `expected 403 for ${actor}`);
    }
  });
});

describe("FLW-18 — update client", () => {
  test("updates allowed fields and returns the updated client", async () => {
    const client = await createClientAs("admin");

    const response = await request("PATCH", `/clients/${client.id}`, {
      actor: "admin",
      body: { status: "inactive", notes: "Paused billing" },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.message, "Client updated successfully");
    assert.equal(response.body.data.status, "inactive");
    assert.equal(response.body.data.notes, "Paused billing");

    const stored = await Client.findById(client.id).lean();
    assert.equal(stored.status, "inactive");
  });

  test("can set and clear the account manager", async () => {
    const client = await createClientAs("admin");

    const assigned = await request("PATCH", `/clients/${client.id}`, {
      actor: "admin",
      body: { accountManager: ids.amOneId },
    });
    assert.equal(assigned.status, 200);
    assert.equal(assigned.body.data.accountManager.id, ids.amOneId);

    const cleared = await request("PATCH", `/clients/${client.id}`, {
      actor: "admin",
      body: { accountManager: null },
    });
    assert.equal(cleared.status, 200);
    assert.equal(cleared.body.data.accountManager, null);
  });

  test("rejects empty, unknown, and malformed payloads", async () => {
    const client = await createClientAs("admin");

    const empty = await request("PATCH", `/clients/${client.id}`, { actor: "admin", body: {} });
    assert.equal(empty.status, 400);

    const unknown = await request("PATCH", `/clients/${client.id}`, {
      actor: "admin",
      body: { createdBy: ids.amTwoId },
    });
    assert.equal(unknown.status, 400);
    assert.ok(unknown.body.errors.some((entry) => entry.field === "createdBy"));

    const malformed = await request("PATCH", "/clients/not-an-id", {
      actor: "admin",
      body: { status: "active" },
    });
    assert.equal(malformed.status, 400);
  });

  test("returns 404 for a missing client", async () => {
    const response = await request("PATCH", "/clients/507f1f77bcf86cd799439011", {
      actor: "admin",
      body: { status: "active" },
    });

    assert.equal(response.status, 404);
    assert.equal(response.body.message, "Client not found");
  });

  test("denies non-admin roles", async () => {
    const client = await createClientAs("admin");
    const response = await request("PATCH", `/clients/${client.id}`, {
      actor: "amOne",
      body: { status: "inactive" },
    });

    assert.equal(response.status, 403);
  });
});

describe("FLW-20 — assign teams to clients", () => {
  test("assigns an existing team to an existing client", async () => {
    const client = await createClientAs("admin");

    const response = await request("POST", `/clients/${client.id}/teams`, {
      actor: "admin",
      body: { teamId: fixtures.teamOneId },
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.message, "Team assigned to client successfully");

    const assignment = response.body.data;
    assert.equal(assignment.team.id, fixtures.teamOneId);
    assert.equal(assignment.team.name, "Creative Studio");
    assert.equal(assignment.team.memberCount, 2);
    assert.equal(assignment.assignedBy, ids.adminId);
    assert.ok(!Number.isNaN(Date.parse(assignment.assignedAt)));
  });

  test("rejects duplicate assignments with 409", async () => {
    const client = await createClientAs("admin");
    await assignTeamAsAdmin(client.id, fixtures.teamOneId);

    const duplicate = await request("POST", `/clients/${client.id}/teams`, {
      actor: "admin",
      body: { teamId: fixtures.teamOneId },
    });

    assert.equal(duplicate.status, 409);
    assert.equal(duplicate.body.message, "Team is already assigned to this client");
    assert.equal(await TeamAssignment.countDocuments(), 1);
  });

  test("validates client, team, and payload", async () => {
    const client = await createClientAs("admin");

    const missingClient = await request("POST", "/clients/507f1f77bcf86cd799439011/teams", {
      actor: "admin",
      body: { teamId: fixtures.teamOneId },
    });
    assert.equal(missingClient.status, 404);
    assert.equal(missingClient.body.message, "Client not found");

    const missingTeam = await request("POST", `/clients/${client.id}/teams`, {
      actor: "admin",
      body: { teamId: "507f1f77bcf86cd799439011" },
    });
    assert.equal(missingTeam.status, 404);
    assert.equal(missingTeam.body.message, "Team not found");

    const malformedClient = await request("POST", "/clients/not-an-id/teams", {
      actor: "admin",
      body: { teamId: fixtures.teamOneId },
    });
    assert.equal(malformedClient.status, 400);

    const malformedTeam = await request("POST", `/clients/${client.id}/teams`, {
      actor: "admin",
      body: { teamId: "nope" },
    });
    assert.equal(malformedTeam.status, 400);
    assert.ok(malformedTeam.body.errors.some((entry) => entry.field === "teamId"));

    const missingBody = await request("POST", `/clients/${client.id}/teams`, {
      actor: "admin",
      body: {},
    });
    assert.equal(missingBody.status, 400);

    const unknownField = await request("POST", `/clients/${client.id}/teams`, {
      actor: "admin",
      body: { teamId: fixtures.teamOneId, assignedBy: ids.amTwoId },
    });
    assert.equal(unknownField.status, 400);
    assert.ok(unknownField.body.errors.some((entry) => entry.field === "assignedBy"));
  });

  test("lists teams assigned to a client", async () => {
    const client = await createClientAs("admin");
    await assignTeamAsAdmin(client.id, fixtures.teamOneId);
    await assignTeamAsAdmin(client.id, fixtures.teamTwoId);

    const response = await request("GET", `/clients/${client.id}/teams`, { actor: "admin" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 2);
    const teamIds = response.body.data.map((entry) => entry.team.id);
    assert.ok(teamIds.includes(fixtures.teamOneId));
    assert.ok(teamIds.includes(fixtures.teamTwoId));
  });

  test("returns an empty list for a client without teams and 404 for a missing client", async () => {
    const client = await createClientAs("admin");

    const empty = await request("GET", `/clients/${client.id}/teams`, { actor: "admin" });
    assert.equal(empty.status, 200);
    assert.deepEqual(empty.body.data, []);

    const missing = await request("GET", "/clients/507f1f77bcf86cd799439011/teams", {
      actor: "admin",
    });
    assert.equal(missing.status, 404);

    const malformed = await request("GET", "/clients/not-an-id/teams", { actor: "admin" });
    assert.equal(malformed.status, 400);
  });

  test("removes an assignment without deleting the client or the team", async () => {
    const client = await createClientAs("admin", { accountManager: ids.amOneId });
    await assignTeamAsAdmin(client.id, fixtures.teamOneId);

    const response = await request("DELETE", `/clients/${client.id}/teams/${fixtures.teamOneId}`, {
      actor: "admin",
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.message, "Team assignment removed successfully");
    assert.equal(await TeamAssignment.countDocuments(), 0);

    const teams = await request("GET", `/clients/${client.id}/teams`, { actor: "admin" });
    assert.deepEqual(teams.body.data, []);

    const clientStillExists = await Client.exists({ _id: client.id });
    assert.ok(clientStillExists);

    const teamStillExists = await Team.exists({ _id: fixtures.teamOneId });
    assert.ok(teamStillExists);
  });

  test("returns 404 when removing an assignment that does not exist", async () => {
    const client = await createClientAs("admin");

    const response = await request("DELETE", `/clients/${client.id}/teams/${fixtures.teamOneId}`, {
      actor: "admin",
    });

    assert.equal(response.status, 404);
    assert.equal(response.body.message, "Team is not assigned to this client");

    const malformed = await request("DELETE", `/clients/${client.id}/teams/nope`, {
      actor: "admin",
    });
    assert.equal(malformed.status, 400);
  });

  test("denies non-admin roles on every assignment endpoint", async () => {
    const client = await createClientAs("admin");
    await assignTeamAsAdmin(client.id, fixtures.teamOneId);

    for (const actor of ["amOne", "employee"]) {
      const assign = await request("POST", `/clients/${client.id}/teams`, {
        actor,
        body: { teamId: fixtures.teamTwoId },
      });
      assert.equal(assign.status, 403, `expected 403 for ${actor} POST`);

      const list = await request("GET", `/clients/${client.id}/teams`, { actor });
      assert.equal(list.status, 403, `expected 403 for ${actor} GET`);

      const remove = await request("DELETE", `/clients/${client.id}/teams/${fixtures.teamOneId}`, {
        actor,
      });
      assert.equal(remove.status, 403, `expected 403 for ${actor} DELETE`);
    }
  });
});

describe("FLW-39 — view client details", () => {
  test("returns full details incl. account manager, teams, and timestamps for an admin", async () => {
    const client = await createClientAs("admin", {
      accountManager: ids.amOneId,
      description: "Strategic account",
    });
    await assignTeamAsAdmin(client.id, fixtures.teamOneId);

    const response = await request("GET", `/clients/${client.id}`, { actor: "admin" });

    assert.equal(response.status, 200);
    const detail = response.body.data;
    assert.equal(detail.id, client.id);
    assert.equal(detail.description, "Strategic account");
    assert.deepEqual(detail.accountManager, {
      id: ids.amOneId,
      name: "Anna Manager",
      email: "am1@flow.test",
      role: "account_manager",
    });
    assert.equal(detail.teams.length, 1);
    assert.equal(detail.teams[0].team.id, fixtures.teamOneId);
    assert.ok(!Number.isNaN(Date.parse(detail.createdAt)));
    assert.ok(!Number.isNaN(Date.parse(detail.updatedAt)));
    assert.ok(!response.text.includes("password"));
  });

  test("allows the assigned account manager to view their own client", async () => {
    const client = await createClientAs("admin", { accountManager: ids.amOneId });

    const response = await request("GET", `/clients/${client.id}`, { actor: "amOne" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.id, client.id);
  });

  test("forbids account managers from viewing clients assigned to someone else", async () => {
    const otherClient = await createClientAs("admin", { accountManager: ids.amTwoId });
    const unassignedClient = await createClientAs("admin");

    const foreign = await request("GET", `/clients/${otherClient.id}`, { actor: "amOne" });
    assert.equal(foreign.status, 403);
    assert.equal(foreign.body.message, "Account managers can only view clients assigned to them");

    const unassigned = await request("GET", `/clients/${unassignedClient.id}`, { actor: "amOne" });
    assert.equal(unassigned.status, 403);
  });

  test("denies employees on client detail", async () => {
    const client = await createClientAs("admin");
    const response = await request("GET", `/clients/${client.id}`, { actor: "employee" });

    assert.equal(response.status, 403);
  });

  test("handles missing and malformed client identifiers", async () => {
    const missing = await request("GET", "/clients/507f1f77bcf86cd799439011", { actor: "admin" });
    assert.equal(missing.status, 404);
    assert.equal(missing.body.message, "Client not found");

    const malformed = await request("GET", "/clients/not-an-id", { actor: "admin" });
    assert.equal(malformed.status, 400);
  });
});
