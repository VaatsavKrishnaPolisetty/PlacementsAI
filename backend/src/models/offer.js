const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    offerId: {
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
    companyId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    packageDetails: {
      ctc: { type: Number, default: 0 },
      baseSalary: { type: Number, default: 0 },
      bonus: { type: Number, default: 0 },
      location: { type: String, default: "" },
      joiningDate: { type: Date },
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
      index: true,
    },
    offerDate: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    decisionDeadline: {
      type: Date,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Offer", offerSchema);
