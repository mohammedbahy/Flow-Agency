import mongoose from "mongoose";

const REVIEW_STATUSES = ["pending", "approved", "rejected"];
const REVIEW_TYPES = ["copy", "visual", "campaign"];

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },

    contentType: {
      type: String,
      enum: REVIEW_TYPES,
      default: "copy",
    },

    client: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },

    project: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },

    submittedBy: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },

    status: {
      type: String,
      enum: REVIEW_STATUSES,
      default: "pending",
    },

    preview: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: null,
    },

    feedback: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },

    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

reviewSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
