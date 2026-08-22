const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    resumeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    studentId: {
      type: String,
      required: true,
      index: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    version: {
      type: Number,
      default: 1,
    },

    extractedText: {
      type: String,
      default: "",
    },

    structuredExtraction: {
      skills: {
        type: [String],
        default: [],
      },

      projects: {
        type: [mongoose.Schema.Types.Mixed],
        default: [],
      },

      certifications: {
        type: [String],
        default: [],
      },

      education: {
        type: [mongoose.Schema.Types.Mixed],
        default: [],
      },

      experience: {
        type: [mongoose.Schema.Types.Mixed],
        default: [],
      },

      achievements: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resume", resumeSchema);