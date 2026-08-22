const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    matchId: {
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
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    matchedSkills: {
      type: [String],
      default: [],
    },
    partialSkills: {
      type: [String],
      default: [],
    },
    skillGaps: {
      type: [String],
      default: [],
    },
    breakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    assessments: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    recommendation: {
      type: String,
      default: "REVIEW",
    },
    evidence: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    explanation: {
      type: String,
      default: "",
    },
    readinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
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

module.exports = mongoose.model("Match", matchSchema);
