import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, beforeEach, describe, test } from "node:test";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import createApp from "../app.js";
import AgencySettings from "../models/agency-settings.js";
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
  const accountManager = await User.create({
    name: "Anna Manager",
    email: "am@flow.test",
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
  actors.accountManager = { _id: accountManager._id, role: "account_manager" };
  actors.employee = { _id: employee._id, role: "employee" };

  const app = createApp({ identityMiddleware });
  const started = await startServer(app);
  server = started.instance;
  baseUrl = started.url;
});

beforeEach(async () => {
  await AgencySettings.deleteMany({});
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  await stopServer(server);
});

describe("GET /agency-settings", () => {
  test("admin retrieves settings; first access creates the singleton with defaults", async () => {
    const response = await request("GET", "/agency-settings", { actor: "admin" });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.name, "My Agency");
    assert.equal(response.body.data.email, null);
    assert.equal(response.body.data.phone, null);
    assert.equal(response.body.data.address, null);
    assert.ok(response.body.data.id);
    assert.ok(response.body.data.createdAt);
    assert.equal(response.body.data.key, undefined);
  });

  test("singleton persists across requests with a stable id", async () => {
    const first = await request("GET", "/agency-settings", { actor: "admin" });
    const second = await request("GET", "/agency-settings", { actor: "admin" });

    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(second.body.data.id, first.body.data.id);

    const stored = await AgencySettings.countDocuments();
    assert.equal(stored, 1);
  });

  test("account manager receives 403", async () => {
    const response = await request("GET", "/agency-settings", { actor: "accountManager" });

    assert.equal(response.status, 403);
    assert.equal(response.body.success, false);
  });

  test("employee receives 403", async () => {
    const response = await request("GET", "/agency-settings", { actor: "employee" });

    assert.equal(response.status, 403);
  });

  test("unauthenticated request receives 401", async () => {
    const response = await request("GET", "/agency-settings");

    assert.equal(response.status, 401);
  });

  test("database failure returns the standard error envelope", async () => {
    const original = AgencySettings.findOne;
    AgencySettings.findOne = async () => {
      throw new Error("connection lost");
    };

    try {
      const response = await request("GET", "/agency-settings", { actor: "admin" });

      assert.equal(response.status, 500);
      assert.equal(response.body.success, false);
      assert.equal(response.body.message, "Internal server error");
    } finally {
      AgencySettings.findOne = original;
    }
  });
});

describe("PATCH /agency-settings", () => {
  test("admin updates all fields and the response reflects the changes", async () => {
    const response = await request("PATCH", "/agency-settings", {
      actor: "admin",
      body: {
        name: "Flow Agency",
        email: "Contact@flow-agency.com",
        phone: "+1 555 0100",
        address: "12 Harbor Street",
      },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.message, "Agency settings updated successfully");
    assert.equal(response.body.data.name, "Flow Agency");
    assert.equal(response.body.data.email, "contact@flow-agency.com");
    assert.equal(response.body.data.phone, "+1 555 0100");
    assert.equal(response.body.data.address, "12 Harbor Street");
  });

  test("patch persists and is returned by subsequent reads", async () => {
    await request("PATCH", "/agency-settings", {
      actor: "admin",
      body: { name: "Flow Agency" },
    });

    const stored = await AgencySettings.findOne({ key: "agency" });
    assert.equal(stored.name, "Flow Agency");

    const read = await request("GET", "/agency-settings", { actor: "admin" });
    assert.equal(read.body.data.name, "Flow Agency");
  });

  test("partial patch leaves other fields unchanged", async () => {
    await request("PATCH", "/agency-settings", {
      actor: "admin",
      body: { name: "Flow Agency", phone: "+1 555 0100" },
    });

    const response = await request("PATCH", "/agency-settings", {
      actor: "admin",
      body: { email: "hello@flow-agency.com" },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.name, "Flow Agency");
    assert.equal(response.body.data.phone, "+1 555 0100");
    assert.equal(response.body.data.email, "hello@flow-agency.com");
    assert.equal(response.body.data.address, null);
  });

  test("null clears optional fields", async () => {
    await request("PATCH", "/agency-settings", {
      actor: "admin",
      body: { email: "hello@flow-agency.com", address: "12 Harbor Street" },
    });

    const response = await request("PATCH", "/agency-settings", {
      actor: "admin",
      body: { email: null, address: null },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.email, null);
    assert.equal(response.body.data.address, null);
  });

  test("PATCH creates the singleton when it does not exist yet", async () => {
    const response = await request("PATCH", "/agency-settings", {
      actor: "admin",
      body: { name: "Flow Agency" },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.name, "Flow Agency");

    const stored = await AgencySettings.countDocuments();
    assert.equal(stored, 1);
  });

  test("unknown and protected fields are rejected", async () => {
    const createdBy = await request("PATCH", "/agency-settings", {
      actor: "admin",
      body: { createdBy: actors.admin._id.toString() },
    });
    assert.equal(createdBy.status, 400);
    assert.equal(createdBy.body.errors[0].message, "Unknown field: createdBy");

    const id = await request("PATCH", "/agency-settings", {
      actor: "admin",
      body: { _id: "whatever" },
    });
    assert.equal(id.status, 400);
    assert.equal(id.body.errors[0].field, "_id");

    const timestamp = await request("PATCH", "/agency-settings", {
      actor: "admin",
      body: { createdAt: "2026-01-01T00:00:00.000Z" },
    });
    assert.equal(timestamp.status, 400);
    assert.equal(timestamp.body.errors[0].field, "createdAt");
  });

  test("invalid values are rejected", async () => {
    const shortName = await request("PATCH", "/agency-settings", {
      actor: "admin",
      body: { name: "x" },
    });
    assert.equal(shortName.status, 400);
    assert.equal(shortName.body.errors[0].field, "name");

    const badEmail = await request("PATCH", "/agency-settings", {
      actor: "admin",
      body: { email: "not-an-email" },
    });
    assert.equal(badEmail.status, 400);
    assert.equal(badEmail.body.errors[0].field, "email");

    const wrongType = await request("PATCH", "/agency-settings", {
      actor: "admin",
      body: { phone: 5550100 },
    });
    assert.equal(wrongType.status, 400);
    assert.equal(wrongType.body.errors[0].field, "phone");
  });

  test("empty patch body is rejected", async () => {
    const response = await request("PATCH", "/agency-settings", {
      actor: "admin",
      body: {},
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.errors[0].field, "body");
  });

  test("account manager receives 403", async () => {
    const response = await request("PATCH", "/agency-settings", {
      actor: "accountManager",
      body: { name: "Flow Agency" },
    });

    assert.equal(response.status, 403);
  });

  test("employee receives 403", async () => {
    const response = await request("PATCH", "/agency-settings", {
      actor: "employee",
      body: { name: "Flow Agency" },
    });

    assert.equal(response.status, 403);
  });

  test("unauthenticated request receives 401", async () => {
    const response = await request("PATCH", "/agency-settings", {
      body: { name: "Flow Agency" },
    });

    assert.equal(response.status, 401);
  });

  test("database failure returns the standard error envelope", async () => {
    const original = AgencySettings.findOneAndUpdate;
    AgencySettings.findOneAndUpdate = async () => {
      throw new Error("connection lost");
    };

    try {
      const response = await request("PATCH", "/agency-settings", {
        actor: "admin",
        body: { name: "Flow Agency" },
      });

      assert.equal(response.status, 500);
      assert.equal(response.body.success, false);
      assert.equal(response.body.message, "Internal server error");
    } finally {
      AgencySettings.findOneAndUpdate = original;
    }
  });
});
