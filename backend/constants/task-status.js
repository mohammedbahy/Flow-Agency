/**
 * Task lifecycle statuses (FLW-107 / FLW-111). A task counts as "completed"
 * only when its status equals COMPLETED; every other status is treated as
 * not-yet-completed for completion-rate and delayed-task calculations.
 */
export const TASK_STATUS = Object.freeze({
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});

export const TASK_STATUS_VALUES = Object.freeze(Object.values(TASK_STATUS));

export const COMPLETED_STATUS = TASK_STATUS.COMPLETED;
