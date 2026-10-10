import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, beforeEach, describe, test } from "node:test";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import createApp from "../app.js";
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

const createTaskAs = async (actor, overrides = {}) => {
  const response = await request("POST", "/tasks", {
    actor,
    body: { title: "Design homepage", client: ids.clientOneId, team: ids.teamOneId, ...overrides },
  });
  assert.equal(response.status, 201, response.text);
  return response.body.data;
};

const patchTaskAs = async (actor, taskId, body, expectedStatus = 200) => {
  const response = await request("PATCH", `/tasks/${taskId}`, { actor, body });
  assert.equal(response.status, expectedStatus, response.text);
  return response.body;
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
  await TeamAssignment.create({ client: clientTwo._id, team: teamTwo._id, assignedBy: admin._id });

  actors.admin = { _id: admin._id, role: "admin" };
  actors.amOne = { _id: amOne._id, role: "account_manager" };
  actors.amTwo = { _id: amTwo._id, role: "account_manager" };
  actors.employee = { _id: employee._id, role: "employee" };
  actors.outsider = { _id: outsider._id, role: "employee" };

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
  await Task.deleteMany({});
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  await stopServer(server);
});

describe("POST /tasks", () => {
  test("admin creates a task with populated refs and server-managed fields", async () => {
    const task = await createTaskAs("admin", { description: "Hero section first" });

    assert.equal(task.title, "Design homepage");
    assert.equal(task.description, "Hero section first");
    assert.equal(task.status, "pending");
    assert.equal(task.completedAt, null);
    assert.equal(task.createdBy, ids.adminId);
    assert.equal(task.client.id, ids.clientOneId);
    assert.equal(task.client.name, "Aurora Media");
    assert.equal(task.team.id, ids.teamOneId);
    assert.equal(task.team.name, "Design & Motion");
    assert.equal(task.assignedTo, null);
  });

  test("createdBy from the request body is rejected as an unknown field", async () => {
    const response = await request("POST", "/tasks", {
      actor: "admin",
      body: {
        title: "Design homepage",
        client: ids.clientOneId,
        team: ids.teamOneId,
        createdBy: ids.adminId,
      },
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
    assert.equal(response.body.errors[0].field, "createdBy");
  });

  test("client-supplied completedAt is rejected as an unknown field", async () => {
    const response = await request("POST", "/tasks", {
      actor: "admin",
      body: {
        title: "Design homepage",
        client: ids.clientOneId,
        team: ids.teamOneId,
        completedAt: "2026-01-01T00:00:00.000Z",
      },
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.errors[0].field, "completedAt");
  });

  test("rejects a missing title", async () => {
    const response = await request("POST", "/tasks", {
      actor: "admin",
      body: { client: ids.clientOneId, team: ids.teamOneId },
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.errors[0].field, "title");
  });

  test("rejects titles that are too short or too long", async () => {
    const short = await request("POST", "/tasks", {
      actor: "admin",
      body: { title: "x", client: ids.clientOneId, team: ids.teamOneId },
    });
    assert.equal(short.status, 400);
    assert.equal(short.body.errors[0].field, "title");

    const long = await request("POST", "/tasks", {
      actor: "admin",
      body: { title: "a".repeat(101), client: ids.clientOneId, team: ids.teamOneId },
    });
    assert.equal(long.status, 400);
    assert.equal(long.body.errors[0].field, "title");
  });

  test("rejects an invalid client id and a missing client", async () => {
    const invalid = await request("POST", "/tasks", {
      actor: "admin",
      body: { title: "Design homepage", client: "not-an-id", team: ids.teamOneId },
    });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.errors[0].field, "client");

    const missing = await request("POST", "/tasks", {
      actor: "admin",
      body: {
        title: "Design homepage",
        client: String(new mongoose.Types.ObjectId()),
        team: ids.teamOneId,
      },
    });
    assert.equal(missing.status, 404);
    assert.equal(missing.body.message, "Client not found");
  });

  test("rejects a missing team", async () => {
    const response = await request("POST", "/tasks", {
      actor: "admin",
      body: {
        title: "Design homepage",
        client: ids.clientOneId,
        team: String(new mongoose.Types.ObjectId()),
      },
    });

    assert.equal(response.status, 404);
    assert.equal(response.body.message, "Team not found");
  });

  test("rejects a team that is not assigned to the client", async () => {
    const response = await request("POST", "/tasks", {
      actor: "admin",
      body: { title: "Design homepage", client: ids.clientOneId, team: ids.teamTwoId },
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.errors[0].field, "team");
  });

  test("rejects an assignee that does not exist", async () => {
    const response = await request("POST", "/tasks", {
      actor: "admin",
      body: {
        title: "Design homepage",
        client: ids.clientOneId,
        team: ids.teamOneId,
        assignedTo: String(new mongoose.Types.ObjectId()),
      },
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.errors[0].field, "assignedTo");
  });

  test("rejects an assignee who is not a member of the assigned team", async () => {
    const response = await request("POST", "/tasks", {
      actor: "admin",
      body: {
        title: "Design homepage",
        client: ids.clientOneId,
        team: ids.teamOneId,
        assignedTo: ids.outsiderId,
      },
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.errors[0].field, "assignedTo");
    assert.match(response.body.errors[0].message, /member of the assigned team/);
  });

  test("accepts an assignee who is a member of the assigned team", async () => {
    const task = await createTaskAs("admin", { assignedTo: ids.employeeId });

    assert.equal(task.assignedTo.id, ids.employeeId);
    assert.equal(task.assignedTo.name, "Eve Employee");
  });

  test("account manager can create a task for an assigned client", async () => {
    const response = await request("POST", "/tasks", {
      actor: "amOne",
      body: { title: "Design homepage", client: ids.clientOneId, team: ids.teamOneId },
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.data.createdBy, ids.amOneId);
  });

  test("account manager cannot create a task for another manager's client", async () => {
    const response = await request("POST", "/tasks", {
      actor: "amOne",
      body: { title: "Write copy deck", client: ids.clientTwoId, team: ids.teamTwoId },
    });

    assert.equal(response.status, 403);
  });

  test("employee cannot create a task", async () => {
    const response = await request("POST", "/tasks", {
      actor: "employee",
      body: { title: "Design homepage", client: ids.clientOneId, team: ids.teamOneId },
    });

    assert.equal(response.status, 403);
  });

  test("unauthenticated requests are rejected with 401", async () => {
    const response = await request("POST", "/tasks", {
      body: { title: "Design homepage", client: ids.clientOneId, team: ids.teamOneId },
    });

    assert.equal(response.status, 401);
  });
});

describe("GET /tasks", () => {
  test("admin sees all tasks with populated refs", async () => {
    await createTaskAs("admin");
    await createTaskAs("admin", {
      title: "Write copy deck",
      client: ids.clientTwoId,
      team: ids.teamTwoId,
      assignedTo: ids.outsiderId,
    });

    const response = await request("GET", "/tasks", { actor: "admin" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 2);
    assert.equal(response.body.data[0].client.name, "Borealis Co");
    assert.ok(response.body.pagination.total >= 2);
  });

  test("status=completed returns only completed tasks", async () => {
    await createTaskAs("admin", { title: "Finished task" });
    const pendingTask = await createTaskAs("admin", { title: "Pending task" });
    const activeTask = await createTaskAs("admin", { title: "Active task" });
    const cancelledTask = await createTaskAs("admin", { title: "Cancelled task" });

    await patchTaskAs("admin", pendingTask.id, { status: "in_progress" });
    await patchTaskAs("admin", activeTask.id, { status: "in_progress" });
    await patchTaskAs("admin", activeTask.id, { status: "completed" });
    await patchTaskAs("admin", cancelledTask.id, { status: "cancelled" });

    const response = await request("GET", "/tasks?status=completed", { actor: "admin" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].title, "Active task");
    assert.equal(response.body.data[0].status, "completed");
    assert.ok(response.body.data[0].completedAt);
  });

  test("rejects an unknown status filter", async () => {
    const response = await request("GET", "/tasks?status=done", { actor: "admin" });

    assert.equal(response.status, 400);
    assert.equal(response.body.errors[0].field, "status");
  });

  test("search matches titles case-insensitively and treats regex literally", async () => {
    await createTaskAs("admin", { title: "Quarterly (Q3) Report" });

    const match = await request("GET", "/tasks?search=quarterly", { actor: "admin" });
    assert.equal(match.status, 200);
    assert.equal(match.body.data.length, 1);

    const literal = await request("GET", "/tasks?search=(Q3", { actor: "admin" });
    assert.equal(literal.status, 200);
    assert.equal(literal.body.data.length, 1);

    const regexAttempt = await request("GET", "/tasks?search=.*", { actor: "admin" });
    assert.equal(regexAttempt.status, 200);
    assert.equal(regexAttempt.body.data.length, 0);
  });

  test("returns an empty page when nothing matches", async () => {
    const response = await request("GET", "/tasks?search=zzz-no-match", { actor: "admin" });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body.data, []);
    assert.equal(response.body.pagination.total, 0);
    assert.equal(response.body.pagination.totalPages, 0);
  });

  test("filters by clientId and teamId", async () => {
    await createTaskAs("admin", { title: "Client one task" });
    await createTaskAs("admin", {
      title: "Client two task",
      client: ids.clientTwoId,
      team: ids.teamTwoId,
    });

    const byClient = await request("GET", `/tasks?clientId=${ids.clientTwoId}`, { actor: "admin" });
    assert.equal(byClient.body.data.length, 1);
    assert.equal(byClient.body.data[0].client.id, ids.clientTwoId);

    const byTeam = await request("GET", `/tasks?teamId=${ids.teamTwoId}`, { actor: "admin" });
    assert.equal(byTeam.body.data.length, 1);
    assert.equal(byTeam.body.data[0].team.id, ids.teamTwoId);
  });

  test("rejects invalid clientId and teamId filters", async () => {
    const client = await request("GET", "/tasks?clientId=bad-id", { actor: "admin" });
    assert.equal(client.status, 400);
    assert.equal(client.body.errors[0].field, "clientId");

    const team = await request("GET", "/tasks?teamId=bad-id", { actor: "admin" });
    assert.equal(team.status, 400);
    assert.equal(team.body.errors[0].field, "teamId");
  });

  test("paginates with validated page and limit", async () => {
    await createTaskAs("admin", { title: "Batch task 1" });
    await createTaskAs("admin", { title: "Batch task 2" });
    await createTaskAs("admin", { title: "Batch task 3" });

    const pageOne = await request("GET", "/tasks?search=Batch&limit=2&page=1", { actor: "admin" });
    assert.equal(pageOne.status, 200);
    assert.equal(pageOne.body.data.length, 2);
    assert.equal(pageOne.body.pagination.total, 3);
    assert.equal(pageOne.body.pagination.totalPages, 2);

    const pageTwo = await request("GET", "/tasks?search=Batch&limit=2&page=2", { actor: "admin" });
    assert.equal(pageTwo.body.data.length, 1);
    assert.equal(pageTwo.body.pagination.page, 2);

    const oversizeLimit = await request("GET", "/tasks?limit=101", { actor: "admin" });
    assert.equal(oversizeLimit.status, 400);

    const overflowPage = await request("GET", `/tasks?page=${"9".repeat(400)}`, { actor: "admin" });
    assert.equal(overflowPage.status, 400);
  });

  test("account manager only sees tasks of their own clients", async () => {
    await createTaskAs("admin", { title: "Own client task" });
    await createTaskAs("admin", {
      title: "Other manager task",
      client: ids.clientTwoId,
      team: ids.teamTwoId,
    });

    const response = await request("GET", "/tasks", { actor: "amOne" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].client.id, ids.clientOneId);

    const foreignClient = await request("GET", `/tasks?clientId=${ids.clientTwoId}`, { actor: "amOne" });
    assert.equal(foreignClient.status, 200);
    assert.deepEqual(foreignClient.body.data, []);
  });

  test("employee only sees tasks assigned to them", async () => {
    await createTaskAs("admin", { title: "My task", assignedTo: ids.employeeId });
    await createTaskAs("admin", { title: "Unassigned task" });
    await createTaskAs("admin", {
      title: "Colleague task",
      client: ids.clientTwoId,
      team: ids.teamTwoId,
      assignedTo: ids.outsiderId,
    });

    const response = await request("GET", "/tasks", { actor: "employee" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].title, "My task");
    assert.equal(response.body.data[0].assignedTo.id, ids.employeeId);
  });

  test("unauthenticated requests are rejected with 401", async () => {
    const response = await request("GET", "/tasks");

    assert.equal(response.status, 401);
  });
});

describe("PATCH /tasks/:taskId", () => {
  test("admin updates permitted fields", async () => {
    const task = await createTaskAs("admin");

    const response = await patchTaskAs("admin", task.id, {
      title: "Redesign homepage",
      description: "New direction",
    });

    assert.equal(response.data.title, "Redesign homepage");
    assert.equal(response.data.description, "New direction");
    assert.equal(response.data.status, "pending");
  });

  test("rejects empty payloads, unknown fields, and immutable refs", async () => {
    const task = await createTaskAs("admin");

    const empty = await patchTaskAs("admin", task.id, {}, 400);
    assert.equal(empty.errors[0].field, "body");

    const unknown = await patchTaskAs("admin", task.id, { priority: "high" }, 400);
    assert.equal(unknown.errors[0].message, "Unknown field: priority");

    const clientRef = await patchTaskAs("admin", task.id, { client: ids.clientTwoId }, 400);
    assert.equal(clientRef.errors[0].message, "Unknown field: client");
  });

  test("rejects an invalid task id and a missing task", async () => {
    const invalid = await request("PATCH", "/tasks/not-an-id", {
      actor: "admin",
      body: { title: "New title" },
    });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.message, "Invalid task id");

    const missing = await patchTaskAs("admin", String(new mongoose.Types.ObjectId()), { title: "New title" }, 404);
    assert.equal(missing.message, "Task not found");
  });

  test("same-status update is an accepted no-op", async () => {
    const task = await createTaskAs("admin");

    const response = await patchTaskAs("admin", task.id, { status: "pending" });

    assert.equal(response.data.status, "pending");
    assert.equal(response.data.completedAt, null);
  });

  test("pending to in_progress keeps completedAt null", async () => {
    const task = await createTaskAs("admin");

    const response = await patchTaskAs("admin", task.id, { status: "in_progress" });

    assert.equal(response.data.status, "in_progress");
    assert.equal(response.data.completedAt, null);
  });

  test("in_progress to completed sets completedAt", async () => {
    const task = await createTaskAs("admin");
    await patchTaskAs("admin", task.id, { status: "in_progress" });

    const response = await patchTaskAs("admin", task.id, { status: "completed" });

    assert.equal(response.data.status, "completed");
    assert.ok(response.data.completedAt);
    assert.ok(!Number.isNaN(new Date(response.data.completedAt).getTime()));
  });

  test("admin can reopen a completed task and completedAt is cleared", async () => {
    const task = await createTaskAs("admin");
    await patchTaskAs("admin", task.id, { status: "in_progress" });
    await patchTaskAs("admin", task.id, { status: "completed" });

    const response = await patchTaskAs("admin", task.id, { status: "pending" });

    assert.equal(response.data.status, "pending");
    assert.equal(response.data.completedAt, null);
  });

  test("account manager cannot reopen a completed task", async () => {
    const task = await createTaskAs("amOne");
    await patchTaskAs("admin", task.id, { status: "in_progress" });
    await patchTaskAs("admin", task.id, { status: "completed" });

    const response = await patchTaskAs("amOne", task.id, { status: "pending" }, 403);

    assert.match(response.message, /Only admins can reopen/);
  });

  test("rejects illegal transitions out of cancelled", async () => {
    const task = await createTaskAs("admin");
    await patchTaskAs("admin", task.id, { status: "cancelled" });

    const response = await patchTaskAs("admin", task.id, { status: "in_progress" }, 400);

    assert.equal(response.errors[0].field, "status");
    assert.match(response.errors[0].message, /cannot move from cancelled to in_progress/);
  });

  test("account manager can update tasks of their own clients", async () => {
    const task = await createTaskAs("admin");

    const response = await patchTaskAs("amOne", task.id, { title: "AM update" });

    assert.equal(response.data.title, "AM update");
  });

  test("account manager cannot update tasks of another manager's client", async () => {
    const task = await createTaskAs("admin", {
      title: "Other manager task",
      client: ids.clientTwoId,
      team: ids.teamTwoId,
    });

    await patchTaskAs("amOne", task.id, { title: "Sneaky update" }, 403);
  });

  test("employee can update status on their own task", async () => {
    const task = await createTaskAs("admin", { assignedTo: ids.employeeId });

    const response = await patchTaskAs("employee", task.id, { status: "in_progress" });

    assert.equal(response.data.status, "in_progress");
  });

  test("employee completing their own task sets completedAt", async () => {
    const task = await createTaskAs("admin", { assignedTo: ids.employeeId });
    await patchTaskAs("employee", task.id, { status: "in_progress" });

    const response = await patchTaskAs("employee", task.id, { status: "completed" });

    assert.equal(response.data.status, "completed");
    assert.ok(response.data.completedAt);
  });

  test("employee cannot edit fields other than status", async () => {
    const task = await createTaskAs("admin", { assignedTo: ids.employeeId });

    const response = await patchTaskAs("employee", task.id, { title: "Employee edit" }, 403);

    assert.match(response.message, /only update the status/);
  });

  test("employee cannot update tasks assigned to someone else", async () => {
    const task = await createTaskAs("admin");

    await patchTaskAs("employee", task.id, { status: "in_progress" }, 403);
  });

  test("reassigning validates membership and allows unassignment", async () => {
    const task = await createTaskAs("admin", { assignedTo: ids.employeeId });

    const nonMember = await patchTaskAs("admin", task.id, { assignedTo: ids.outsiderId }, 400);
    assert.equal(nonMember.errors[0].field, "assignedTo");

    const valid = await patchTaskAs("admin", task.id, { assignedTo: ids.employeeId });
    assert.equal(valid.data.assignedTo.id, ids.employeeId);

    const cleared = await patchTaskAs("admin", task.id, { assignedTo: null });
    assert.equal(cleared.data.assignedTo, null);
  });

  test("unauthenticated requests are rejected with 401", async () => {
    const task = await createTaskAs("admin");

    const response = await request("PATCH", `/tasks/${task.id}`, { body: { status: "in_progress" } });

    assert.equal(response.status, 401);
  });
});
