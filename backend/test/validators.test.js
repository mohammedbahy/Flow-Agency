import assert from "node:assert/strict";
import { describe, test } from "node:test";
import HttpError from "../utils/http-error.js";
import { assertValidObjectId } from "../utils/object-id.js";
import {
  validateCreateClientPayload,
  validateListClientsQuery,
  validateUpdateClientPayload,
} from "../validators/client-validator.js";
import { validateAssignTeamPayload } from "../validators/team-assignment-validator.js";

const VALID_ID = "507f1f77bcf86cd799439011";

const captureBadRequest = (run, field) => {
  let error;
  try {
    run();
  } catch (thrown) {
    error = thrown;
  }
  assert.ok(error instanceof HttpError, "expected an HttpError to be thrown");
  assert.equal(error.statusCode, 400);
  if (field !== undefined) {
    assert.ok(
      error.errors?.some((entry) => entry.field === field),
      `expected a validation error for "${field}", got ${JSON.stringify(error.errors)}`,
    );
  }
  return error;
};

describe("validateCreateClientPayload", () => {
  test("accepts a full payload and normalizes values", () => {
    const payload = validateCreateClientPayload({
      name: "  Aurora Media  ",
      description: "  Full-service agency  ",
      email: " Hello@Example.COM ",
      phone: "+1 555 0100",
      accountManager: VALID_ID,
      status: "inactive",
      notes: "Priority account",
    });

    assert.deepEqual(payload, {
      name: "Aurora Media",
      description: "Full-service agency",
      email: "hello@example.com",
      phone: "+1 555 0100",
      accountManager: VALID_ID,
      status: "inactive",
      notes: "Priority account",
    });
  });

  test("accepts a minimal payload", () => {
    assert.deepEqual(validateCreateClientPayload({ name: "Acme" }), { name: "Acme" });
  });

  test("requires a name", () => {
    captureBadRequest(() => validateCreateClientPayload({}), "name");
    captureBadRequest(() => validateCreateClientPayload({ name: "   " }), "name");
    captureBadRequest(() => validateCreateClientPayload({ name: "A" }), "name");
    captureBadRequest(() => validateCreateClientPayload({ name: "x".repeat(101) }), "name");
  });

  test("rejects unknown fields such as client-supplied audit fields", () => {
    captureBadRequest(
      () => validateCreateClientPayload({ name: "Acme", createdBy: VALID_ID }),
      "createdBy",
    );
  });

  test("rejects an invalid email", () => {
    captureBadRequest(() => validateCreateClientPayload({ name: "Acme", email: "not-an-email" }), "email");
  });

  test("rejects an invalid status", () => {
    captureBadRequest(() => validateCreateClientPayload({ name: "Acme", status: "archived" }), "status");
  });

  test("rejects oversized text fields", () => {
    captureBadRequest(
      () => validateCreateClientPayload({ name: "Acme", description: "x".repeat(2001) }),
      "description",
    );
    captureBadRequest(() => validateCreateClientPayload({ name: "Acme", notes: "x".repeat(2001) }), "notes");
  });

  test("rejects a malformed accountManager and allows null", () => {
    captureBadRequest(() => validateCreateClientPayload({ name: "Acme", accountManager: "nope" }), "accountManager");
    assert.equal(validateCreateClientPayload({ name: "Acme", accountManager: null }).accountManager, null);
    assert.equal(validateCreateClientPayload({ name: "Acme", accountManager: "" }).accountManager, null);
  });
});

describe("validateUpdateClientPayload", () => {
  test("accepts a partial payload", () => {
    assert.deepEqual(validateUpdateClientPayload({ status: "inactive" }), { status: "inactive" });
  });

  test("rejects an empty payload", () => {
    captureBadRequest(() => validateUpdateClientPayload({}), "body");
  });

  test("rejects unknown fields", () => {
    captureBadRequest(() => validateUpdateClientPayload({ createdBy: VALID_ID }), "createdBy");
  });

  test("still validates present fields", () => {
    captureBadRequest(() => validateUpdateClientPayload({ name: "" }), "name");
    captureBadRequest(() => validateUpdateClientPayload({ status: "retired" }), "status");
  });
});

describe("validateListClientsQuery", () => {
  test("applies default pagination", () => {
    assert.deepEqual(validateListClientsQuery({}), { page: 1, limit: 10 });
  });

  test("parses filters and pagination", () => {
    const filter = validateListClientsQuery({
      search: "  aurora ",
      status: "active",
      accountManager: VALID_ID,
      page: "2",
      limit: "50",
    });

    assert.deepEqual(filter, {
      search: "aurora",
      status: "active",
      accountManager: VALID_ID,
      page: 2,
      limit: 50,
    });
  });

  test("rejects unknown query parameters", () => {
    captureBadRequest(() => validateListClientsQuery({ sort: "name" }), "sort");
  });

  test("rejects invalid filter values", () => {
    captureBadRequest(() => validateListClientsQuery({ status: "bogus" }), "status");
    captureBadRequest(() => validateListClientsQuery({ accountManager: "nope" }), "accountManager");
  });

  test("rejects invalid pagination values", () => {
    captureBadRequest(() => validateListClientsQuery({ page: "0" }), "page");
    captureBadRequest(() => validateListClientsQuery({ page: "abc" }), "page");
    captureBadRequest(() => validateListClientsQuery({ page: "9".repeat(400) }), "page");
    captureBadRequest(() => validateListClientsQuery({ page: "99999999999999999999" }), "page");
    captureBadRequest(() => validateListClientsQuery({ limit: "101" }), "limit");
  });
});

describe("validateAssignTeamPayload", () => {
  test("accepts a valid teamId", () => {
    assert.deepEqual(validateAssignTeamPayload({ teamId: VALID_ID }), { teamId: VALID_ID });
  });

  test("requires a valid teamId", () => {
    captureBadRequest(() => validateAssignTeamPayload({}), "teamId");
    captureBadRequest(() => validateAssignTeamPayload({ teamId: "nope" }), "teamId");
  });

  test("rejects unknown fields", () => {
    captureBadRequest(() => validateAssignTeamPayload({ teamId: VALID_ID, assignedBy: VALID_ID }), "assignedBy");
  });
});

describe("assertValidObjectId", () => {
  test("accepts a hex ObjectId string", () => {
    assert.doesNotThrow(() => assertValidObjectId(VALID_ID, "client id"));
  });

  test("rejects malformed identifiers with 400", () => {
    captureBadRequest(() => assertValidObjectId("abc", "client id"));
    captureBadRequest(() => assertValidObjectId(42, "client id"));
    captureBadRequest(() => assertValidObjectId(undefined, "client id"));
  });
});

describe("HttpError helpers", () => {
  test("carry the expected status codes", () => {
    assert.equal(HttpError.badRequest("bad").statusCode, 400);
    assert.equal(HttpError.unauthorized().statusCode, 401);
    assert.equal(HttpError.forbidden().statusCode, 403);
    assert.equal(HttpError.notFound().statusCode, 404);
    assert.equal(HttpError.conflict().statusCode, 409);
  });

  test("attach a validation errors array when provided", () => {
    const error = HttpError.badRequest("Validation failed", [{ field: "name", message: "name is required" }]);
    assert.deepEqual(error.errors, [{ field: "name", message: "name is required" }]);
  });
});
