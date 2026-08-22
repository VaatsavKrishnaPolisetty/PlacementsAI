const mongoose = require("mongoose");

const eligibilityResultSchema = new mongoose.Schema(
  {
    eligibilityResultId: {
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
    eligible: {
      type: Boolean,
      required: true,
    },
    reasons: {
      type: [String],
      default: [],
    },
    failedCriteria: {
      type: [String],
      default: [],
    },
    cgpaSatisfied: {
      type: Boolean,
      default: true,
    },
    branchSatisfied: {
      type: Boolean,
      default: true,
    },
    backlogsSatisfied: {
      type: Boolean,
      default: true,
    },
    checkedAt: {
      type: Date,
      default: Date.now,
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

module.exports = mongoose.model("EligibilityResult", eligibilityResultSchema);
