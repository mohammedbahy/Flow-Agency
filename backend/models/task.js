import mongoose from "mongoose";

const TASK_STATUSES = ["pending", "in_progress", "completed", "cancelled"];

// Union schema: the current contract (title/client/team workflow) plus the
// legacy delivery fields (taskType auto-deadline pipeline). Legacy fields are
// optional so both API shapes validate; see validators/task-validator.js.
const TASK_TYPES = ["design", "content", "development", "video", "seo", "other"];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 100,
      default: null,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: TASK_STATUSES,
      default: "pending",
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

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Legacy delivery pipeline fields (auto-deadline from deadline rules).
    taskType: {
      type: String,
      enum: TASK_TYPES,
      default: null,
    },

    publishingDate: {
      type: Date,
      default: null,
    },

    deadline: {
      type: Date,
      default: null,
    },

    // True when the deadline was set manually. Auto-calculation must never
    // overwrite an overridden deadline.
    deadlineOverridden: {
      type: Boolean,
      default: false,
    },

    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    completedAt: {
      type: Date,
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

taskSchema.index({ status: 1, createdAt: -1 });
taskSchema.index({ client: 1, status: 1 });

export default mongoose.model("Task", taskSchema);
