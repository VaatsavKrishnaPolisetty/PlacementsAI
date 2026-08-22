const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    industry: {
      type: String,
      trim: true,
    },

    contactPerson: {
      type: String,
      trim: true,
    },

    contactEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Company", companySchema);