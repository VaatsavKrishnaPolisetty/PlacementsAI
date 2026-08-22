const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    studentId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    jobId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "applied",
        "eligible",
        "not_eligible",
        "shortlisted",
        "interview_scheduled",
        "selected",
        "rejected",
        "offer_received",
        "offer_accepted",
        "withdrawn",
      ],
      default: "applied",
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: String, default: "system" },
        reason: { type: String, default: "" },
      },
    ],
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    currentRound: {
      type: Number,
      default: 1,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Application", applicationSchema);
