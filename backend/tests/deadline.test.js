import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateDeadline } from "../utils/deadline.js";
import { DIRECTIONS, OFFSET_UNITS } from "../constants/deadline.js";

const makeRule = (overrides = {}) => ({
  taskType: "design",
  offsetValue: 3,
  offsetUnit: OFFSET_UNITS.DAYS,
  direction: DIRECTIONS.BEFORE,
  active: true,
  ...overrides,
});

test("calculateDeadline applies BEFORE days rule correctly", () => {
  const pub = new Date("2026-10-10T00:00:00.000Z");
  const deadline = calculateDeadline(
    "design",
    pub,
    [makeRule()],
  );
  assert.equal(deadline.toISOString(), "2026-10-07T00:00:00.000Z");
});

test("calculateDeadline applies AFTER hours rule correctly", () => {
  const pub = new Date("2026-10-10T12:00:00.000Z");
  const rule = makeRule({
    offsetValue: 4,
    offsetUnit: OFFSET_UNITS.HOURS,
    direction: DIRECTIONS.AFTER,
  });
  const deadline = calculateDeadline("design", pub, [rule]);
  assert.equal(deadline.toISOString(), "2026-10-10T16:00:00.000Z");
});

test("calculateDeadline returns null when no matching rule", () => {
  const pub = new Date("2026-10-10T00:00:00.000Z");
  const deadline = calculateDeadline("seo", pub, [makeRule()]);
  assert.equal(deadline, null);
});

test("calculateDeadline returns null for inactive rule", () => {
  const pub = new Date("2026-10-10T00:00:00.000Z");
  const rule = makeRule({ active: false });
  const deadline = calculateDeadline("design", pub, [rule]);
  assert.equal(deadline, null);
});

test("calculateDeadline returns null with missing inputs", () => {
  assert.equal(calculateDeadline(null, new Date()), null);
  assert.equal(calculateDeadline("design", null), null);
});
