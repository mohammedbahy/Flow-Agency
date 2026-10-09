import mongoose from "mongoose";

const teamAssignmentSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

teamAssignmentSchema.index({ team: 1, client: 1 }, { unique: true });

export default mongoose.model("TeamAssignment", teamAssignmentSchema);
