const mongoose = require("mongoose");

const readinessPlanSchema = new mongoose.Schema(
  {
    planId: {
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
    targetRole: {
      type: String,
      default: "",
      trim: true,
    },
    skillGaps: {
      type: [String],
      default: [],
    },
    recommendations: [
      {
        topic: { type: String, required: true },
        resourceUrl: { type: String, default: "" },
        estimatedHours: { type: Number, default: 0 },
        priority: {
          type: String,
          enum: ["low", "medium", "high", "critical"],
          default: "medium",
        },
      },
    ],
    plan: [
      {
        day: { type: Number },
        topic: { type: String },
        tasks: { type: [String], default: [] },
        completed: { type: Boolean, default: false },
      },
    ],
    readinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["draft", "active", "completed"],
      default: "active",
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ReadinessPlan", readinessPlanSchema);
