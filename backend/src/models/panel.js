const mongoose = require("mongoose");

const panelSchema = new mongoose.Schema(
  {
    panelId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    companyId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    panelName: {
      type: String,
      default: "",
      trim: true,
    },
    panelMembers: [
      {
        memberId: { type: String, default: "" },
        name: { type: String, required: true },
        email: { type: String, required: true },
        role: { type: String, default: "Interviewer" },
        phone: { type: String, default: "" },
      },
    ],
    relevantSkills: {
      type: [String],
      default: [],
    },
    availability: [
      {
        date: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        isBooked: { type: Boolean, default: false },
        bookedInterviewId: { type: String, default: "" },
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Panel", panelSchema);
