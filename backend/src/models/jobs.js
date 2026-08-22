const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    companyId: {
      type: String,
      required: true,
      index: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    jdFileUrl: {
      type: String,
      default: "",
    },

    jdText: {
      type: String,
      default: "",
    },

    requirements: {
      branches: {
        type: [String],
        default: [],
      },

      minCGPA: {
        type: Number,
        default: 0,
      },

      maxBacklogs: {
        type: Number,
        default: 0,
      },

      requiredSkills: {
        type: [String],
        default: [],
      },

      preferredSkills: {
        type: [String],
        default: [],
      },

      experience: {
        type: String,
        default: "",
      },

      location: {
        type: String,
        default: "",
      },
    },

    openings: {
      type: Number,
      default: 1,
      min: 1,
    },

    status: {
      type: String,
      enum: ["draft", "active", "closed"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);