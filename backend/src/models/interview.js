const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    interviewId: {
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
    panelId: {
      type: String,
      default: "",
      index: true,
      trim: true,
    },
    roomId: {
      type: String,
      default: "",
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    roundNumber: {
      type: Number,
      default: 1,
    },
    interviewType: {
      type: String,
      enum: ["technical", "hr", "managerial", "coding", "general"],
      default: "technical",
    },
    status: {
      type: String,
      enum: ["scheduled", "rescheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    meetingLink: {
      type: String,
      default: "",
      trim: true,
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    rescheduledFrom: {
      type: String,
      default: "",
    },
    feedback: {
      rating: { type: Number, min: 1, max: 10 },
      remarks: { type: String, default: "" },
      recommendation: {
        type: String,
        enum: ["hire", "reject", "next_round", "hold", ""],
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Interview", interviewSchema);
