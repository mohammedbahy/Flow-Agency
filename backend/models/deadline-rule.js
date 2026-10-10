import mongoose from "mongoose";
import { TASK_TYPES } from "../constants/task-types.js";
import {
  DIRECTION_VALUES,
  OFFSET_UNIT_VALUES,
} from "../constants/deadline.js";

/**
 * FLW-226: one configurable deadline rule per task type. The deadline is
 * derived from the content publishing date, e.g. "design = publishing - 3d".
 */
const deadlineRuleSchema = new mongoose.Schema(
  {
    taskType: {
      type: String,
      enum: TASK_TYPES,
      required: true,
    },

    offsetValue: {
      type: Number,
      required: true,
      min: 0,
    },

    offsetUnit: {
      type: String,
      enum: OFFSET_UNIT_VALUES,
      required: true,
    },

    direction: {
      type: String,
      enum: DIRECTION_VALUES,
      required: true,
    },

    active: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

deadlineRuleSchema.index({ taskType: 1 }, { unique: true });
deadlineRuleSchema.index({ active: 1 });

export default mongoose.model("DeadlineRule", deadlineRuleSchema);
