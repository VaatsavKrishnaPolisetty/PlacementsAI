const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    recipientId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    recipientRole: {
      type: String,
      enum: ["student", "panel", "tpo", "admin", "company"],
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "interview_scheduled",
        "interview_rescheduled",
        "interview_cancelled",
        "room_changed",
        "time_changed",
        "interview_update",
        "candidate_shortlisted",
        "application_update",
        "application_submitted",
        "conflict_detected",
        "conflict_resolved",
        "negotiation_started",
        "tpo_approval_required",
        "interview_reminder",
        "offer_received",
        "offer_accepted",
        "offer_rejected",
        "rematch_triggered",
        "readiness_plan_created",
        "general",
      ],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    channel: {
      type: String,
      enum: ["in_app", "email", "sms", "push", "socket"],
      default: "in_app",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "failed"],
      default: "sent",
    },
    relatedEntity: {
      entityType: { type: String, default: "" },
      entityId: { type: String, default: "" },
      studentId: { type: String, default: "" },
      jobId: { type: String, default: "" },
      interviewId: { type: String, default: "" },
      offerId: { type: String, default: "" },
      conflictId: { type: String, default: "" },
    },
    scheduledAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
