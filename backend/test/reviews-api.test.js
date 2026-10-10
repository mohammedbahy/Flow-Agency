import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, describe, test } from "node:test";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import createApp from "../app.js";
import User from "../models/user.js";

let mongoServer;
let server;
let baseUrl;

const actors = {};

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

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const admin = await User.create({
    name: "Ada Admin",
    email: "admin@flow.test",
    password: "supersecret",
    role: "admin",
  });
  const employee = await User.create({
    name: "Eddie Employee",
    email: "employee@flow.test",
    password: "supersecret",
    role: "employee",
  });

  actors.admin = admin;
  actors.employee = employee;

  const app = createApp({ identityMiddleware });
  const started = await startServer(app);
  server = started.instance;
  baseUrl = started.url;
});

after(async () => {
  await stopServer(server);
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("POST /reviews", () => {
  test("admin creates a review item", async () => {
    const response = await request("POST", "/reviews", {
      actor: "admin",
      body: { title: "Homepage hero copy", contentType: "copy", client: "Acme" },
    });
    assert.equal(response.status, 201, response.text);
    assert.equal(response.body.data.title, "Homepage hero copy");
    assert.equal(response.body.data.status, "pending");
  });

  test("rejects a missing title", async () => {
    const response = await request("POST", "/reviews", {
      actor: "admin",
      body: { contentType: "copy" },
    });
    assert.equal(response.status, 400);
    assert.equal(response.body.errors[0].field, "title");
  });
});

describe("PATCH /reviews/:reviewId/approve", () => {
  test("admin approves a pending item; decided items are locked", async () => {
    const created = await request("POST", "/reviews", {
      actor: "admin",
      body: { title: "Launch visuals" },
    });
    const id = created.body.data.id;

    const approved = await request("PATCH", `/reviews/${id}/approve`, { actor: "admin" });
    assert.equal(approved.status, 200, approved.text);
    assert.equal(approved.body.data.status, "approved");

    const again = await request("PATCH", `/reviews/${id}/approve`, { actor: "admin" });
    assert.equal(again.status, 400);
  });

  test("employee cannot approve", async () => {
    const created = await request("POST", "/reviews", {
      actor: "admin",
      body: { title: "Social calendar" },
    });
    const forbidden = await request("PATCH", `/reviews/${created.body.data.id}/approve`, {
      actor: "employee",
    });
    assert.equal(forbidden.status, 403);
  });
});

describe("PATCH /reviews/:reviewId/reject", () => {
  test("reject requires feedback and records it", async () => {
    const created = await request("POST", "/reviews", {
      actor: "admin",
      body: { title: "Email series" },
    });
    const id = created.body.data.id;

    const missing = await request("PATCH", `/reviews/${id}/reject`, {
      actor: "admin",
      body: {},
    });
    assert.equal(missing.status, 400);
    assert.equal(missing.body.errors[0].field, "feedback");

    const rejected = await request("PATCH", `/reviews/${id}/reject`, {
      actor: "admin",
      body: { feedback: "Rework the headline angle" },
    });
    assert.equal(rejected.status, 200, rejected.text);
    assert.equal(rejected.body.data.status, "rejected");
    assert.equal(rejected.body.data.feedback, "Rework the headline angle");
  });
});

describe("GET /reviews", () => {
  test("filters by status", async () => {
    const response = await request("GET", "/reviews?status=pending", { actor: "admin" });
    assert.equal(response.status, 200);
    assert.ok(response.body.data.every((item) => item.status === "pending"));
  });
});

describe("GET /permissions/matrix", () => {
  test("returns every role with its permissions", async () => {
    const response = await request("GET", "/permissions/matrix", { actor: "admin" });
    assert.equal(response.status, 200);
    const roles = Object.fromEntries(response.body.data.map((row) => [row.role, row.permissions]));
    assert.ok(roles.admin.includes("reviews:manage"));
    assert.ok(roles.employee.includes("reviews:read"));
    assert.ok(!roles.employee.includes("reviews:manage"));
  });
});
