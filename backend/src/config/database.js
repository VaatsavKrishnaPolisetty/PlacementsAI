const mongoose = require("mongoose");

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campus_placement";

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log("✅ MongoDB connected successfully to:", mongoUri.split("@").pop());
  } catch (error) {
    console.warn("⚠️ MongoDB offline or unreachable (" + error.message + "). Operating with high-speed in-memory state & mock database adapter.");
  }
};

module.exports = connectDatabase;