/** Offset units and directions for deadline rules (FLW-226). */
export const OFFSET_UNITS = Object.freeze({
  DAYS: "days",
  HOURS: "hours",
});

export const OFFSET_UNIT_VALUES = Object.freeze(Object.values(OFFSET_UNITS));

export const DIRECTIONS = Object.freeze({
  BEFORE: "before",
  AFTER: "after",
});

export const DIRECTION_VALUES = Object.freeze(Object.values(DIRECTIONS));

/** Milliseconds per supported offset unit. */
export const MS_PER_UNIT = Object.freeze({
  [OFFSET_UNITS.DAYS]: 24 * 60 * 60 * 1000,
  [OFFSET_UNITS.HOURS]: 60 * 60 * 1000,
});
