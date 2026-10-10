import mongoose from "mongoose";
import { TASK_TYPES } from "../constants/task-types.js";
import { TASK_STATUS, TASK_STATUS_VALUES } from "../constants/task-status.js";

/**
 * Minimal Task model required by FLW-227 / FLW-107 / FLW-111. The repo had no
 * Task model, so this defines only the fields those stories need:
 * task type, status, publishing date, deadline, assignee, client and team.
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    taskType: {
      type: String,
      enum: TASK_TYPES,
      required: true,
    },

    status: {
      type: String,
      enum: TASK_STATUS_VALUES,
      default: TASK_STATUS.PENDING,
    },

    publishingDate: {
      type: Date,
      default: null,
    },

    deadline: {
      type: Date,
      default: null,
    },

    // True when an admin set the deadline manually. Auto-calculation from the
    // active deadline rule must never overwrite an overridden deadline.
    deadlineOverridden: {
      type: Boolean,
      default: false,
    },

    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

// Indexes backing the completion-rate and delayed-task aggregations
// (FLW-108 / FLW-112).
taskSchema.index({ status: 1, deadline: 1 });
taskSchema.index({ deadline: 1 });
taskSchema.index({ client: 1 });
taskSchema.index({ team: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ publishingDate: 1 });
taskSchema.index({ taskType: 1 });

export default mongoose.model("Task", taskSchema);
