const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    roomName: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      default: 1,
      min: 1,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    type: {
      type: String,
      enum: ["physical", "virtual"],
      default: "physical",
    },
    meetingLink: {
      type: String,
      default: "",
      trim: true,
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
      enum: ["available", "occupied", "maintenance"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Room", roomSchema);
