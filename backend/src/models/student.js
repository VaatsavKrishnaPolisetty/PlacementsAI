const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    password: {
      type: String,
      default: "password123", // Default bcrypt hash or plain for demo
    },

    role: {
      type: String,
      enum: ["student", "admin", "tpo"],
      default: "student",
    },

    degree: {
      type: String,
      default: "B.Tech",
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    year: {
      type: Number,
      default: 4,
      min: 1,
      max: 5,
    },

    branch: {
      type: String,
      required: true,
      trim: true,
    },

    graduationYear: {
      type: Number,
      required: true,
      default: 2026,
    },

    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    backlogs: {
      type: Number,
      default: 0,
      min: 0,
    },

    skills: {
      technical: {
        type: [String],
        default: ["Python", "SQL", "Data Structures"],
      },
      soft: {
        type: [String],
        default: ["Communication", "Problem Solving", "Teamwork"],
      },
    },

    resume: {
      fileName: { type: String, default: "" },
      fileUrl: { type: String, default: "" },
      uploadedAt: { type: Date, default: null },
      fileSize: { type: Number, default: 0 },
    },

    projects: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    certifications: {
      type: [String],
      default: [],
    },

    placementStatus: {
      type: String,
      enum: [
        "available",
        "applied",
        "shortlisted",
        "interviewing",
        "placed",
        "withdrawn",
      ],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);