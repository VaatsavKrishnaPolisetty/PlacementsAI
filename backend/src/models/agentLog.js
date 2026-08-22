const mongoose = require("mongoose");

const agentLogSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    agent: {
      type: String,
      required: true,
      default: "System",
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    entity: {
      studentId: { type: String, default: "" },
      jobId: { type: String, default: "" },
      interviewId: { type: String, default: "" },
      offerId: { type: String, default: "" },
      conflictId: { type: String, default: "" },
      proposalId: { type: String, default: "" },
      panelId: { type: String, default: "" },
      roomId: { type: String, default: "" },
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["success", "failure", "info", "warning", "pending_approval"],
      default: "info",
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AgentLog", agentLogSchema);
