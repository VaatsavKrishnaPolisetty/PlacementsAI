const mongoose = require("mongoose");
const Notification = require("../../models/notification");
const eventBus = require("../../events/eventBus");
const EventTypes = require("../../events/eventTypes");
const socketService = require("../../services/socketService");

class NotificationAgent {
  constructor() {
    this.name = "NotificationAgent";
    this.isInitialized = false;
  }

  /**
   * Initialize event subscriptions
   */
  init() {
    if (this.isInitialized) return;

    // Listen to placement operational events
    eventBus.subscribe(EventTypes.INTERVIEW_SCHEDULED, (event) =>
      this.handleInterviewScheduled(event)
    );
    eventBus.subscribe(EventTypes.INTERVIEW_RESCHEDULED, (event) =>
      this.handleInterviewRescheduled(event)
    );
    eventBus.subscribe(EventTypes.INTERVIEW_CANCELLED, (event) =>
      this.handleInterviewCancelled(event)
    );
    eventBus.subscribe(EventTypes.CANDIDATE_SHORTLISTED, (event) =>
      this.handleCandidateShortlisted(event)
    );
    eventBus.subscribe(EventTypes.CONFLICT_DETECTED, (event) =>
      this.handleConflictDetected(event)
    );
    eventBus.subscribe(EventTypes.CONFLICT_RESOLVED, (event) =>
      this.handleConflictResolved(event)
    );
    eventBus.subscribe(EventTypes.INTERVIEW_REMINDER, (event) =>
      this.handleInterviewReminder(event)
    );
    eventBus.subscribe(EventTypes.OFFER_RECEIVED, (event) =>
      this.handleOfferReceived(event)
    );
    eventBus.subscribe(EventTypes.OFFER_ACCEPTED, (event) =>
      this.handleOfferAccepted(event)
    );
    eventBus.subscribe(EventTypes.REMATCH_TRIGGERED, (event) =>
      this.handleRematchTriggered(event)
    );
    eventBus.subscribe(EventTypes.READINESS_PLAN_CREATED, (event) =>
      this.handleReadinessPlanCreated(event)
    );
    eventBus.subscribe(EventTypes.TPO_APPROVAL_REQUIRED, (event) =>
      this.handleTpoApprovalRequired(event)
    );

    this.isInitialized = true;
    console.log("🔔 Notification Agent initialized and listening for events");
  }

  /**
   * Helper to persist notification and broadcast via Socket.io
   */
  async createAndSendNotification({
    recipientId,
    recipientRole,
    type,
    title,
    message,
    priority = "medium",
    channel = "in_app",
    relatedEntity = {},
    scheduledAt = null,
  }) {
    try {
      const notificationId = `NOTIF_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase()}`;

      const isConnected = mongoose.connection.readyState === 1;
      const notification = isConnected
        ? await Notification.create({
            notificationId,
            recipientId,
            recipientRole,
            type,
            title,
            message,
            priority,
            channel,
            isRead: false,
            status: "sent",
            relatedEntity,
            scheduledAt,
            sentAt: new Date(),
          })
        : new Notification({
            notificationId,
            recipientId,
            recipientRole,
            type,
            title,
            message,
            priority,
            channel,
            isRead: false,
            status: "sent",
            relatedEntity,
            scheduledAt,
            sentAt: new Date(),
          });

      // Broadcast through Socket.io
      socketService.broadcastNotification(notification);

      // Log notification sent event without circular recursion
      eventBus.publish(EventTypes.NOTIFICATION_SENT, {
        source: this.name,
        message: `Notification sent to ${recipientRole} (${recipientId}): "${title}"`,
        entity: {
          ...relatedEntity,
          notificationId,
          recipientId,
        },
        payload: {
          title,
          priority,
          channel,
        },
      });

      return notification;
    } catch (error) {
      console.error("❌ Failed to create/send notification:", error.message);
      return null;
    }
  }

  // 1. Interview Scheduled: Notify Student, Panel, TPO
  async handleInterviewScheduled(event) {
    const { entity, payload } = event;
    const studentId = entity?.studentId || payload?.studentId;
    const panelId = entity?.panelId || payload?.panelId || "PANEL_DEFAULT";
    const interviewId = entity?.interviewId || payload?.interviewId;
    const date = payload?.date || "Scheduled Date";
    const startTime = payload?.startTime || "Start Time";
    const role = payload?.role || "Interview";

    // Notify Student
    if (studentId) {
      await this.createAndSendNotification({
        recipientId: studentId,
        recipientRole: "student",
        type: "interview_scheduled",
        title: "Interview Scheduled",
        message: `Your interview for ${role} has been scheduled on ${date} at ${startTime}.`,
        priority: "high",
        channel: "in_app",
        relatedEntity: { ...entity, interviewId },
      });
    }

    // Notify Panel
    if (panelId) {
      await this.createAndSendNotification({
        recipientId: panelId,
        recipientRole: "panel",
        type: "interview_scheduled",
        title: "New Interview Assigned",
        message: `You have an interview scheduled with candidate ${studentId} on ${date} at ${startTime}.`,
        priority: "high",
        channel: "in_app",
        relatedEntity: { ...entity, interviewId },
      });
    }

    // Notify TPO
    await this.createAndSendNotification({
      recipientId: "TPO",
      recipientRole: "tpo",
      type: "interview_scheduled",
      title: "Interview Scheduled Confirmation",
      message: `Interview ${interviewId} scheduled for student ${studentId} with panel ${panelId} on ${date} at ${startTime}.`,
      priority: "medium",
      channel: "in_app",
      relatedEntity: { ...entity, interviewId },
    });
  }

  // 2. Interview Rescheduled / Room Change / Time Change: Notify Student, Panel, TPO
  async handleInterviewRescheduled(event) {
    const { entity, payload } = event;
    const studentId = entity?.studentId || payload?.studentId;
    const panelId = entity?.panelId || payload?.panelId;
    const interviewId = entity?.interviewId || payload?.interviewId;
    
    const newDate = payload?.date || payload?.newDate || "New Date";
    const oldTime = payload?.oldStartTime || "10:30 AM";
    const newTime = payload?.startTime || payload?.newStartTime || "2:00 PM";
    const oldRoom = payload?.oldRoom || "Block A - Room 204";
    const newRoom = payload?.newRoom || entity?.roomId || "Block B - Room 302";

    const roomChanged = payload?.roomChanged;
    const timeChanged = payload?.timeChanged;

    let studentTitle = "Interview Rescheduled";
    let studentMessage = `Your interview has been rescheduled to ${newDate} at ${newTime}. Please review updated details.`;
    let studentPriority = "high";
    let notifType = "interview_rescheduled";

    if (roomChanged && timeChanged) {
      studentTitle = "🚨 Interview Update";
      studentMessage = `Your interview details have changed.\n\nPrevious:\n${oldTime} — ${oldRoom}\n\nNew:\n${newTime} — ${newRoom}`;
      studentPriority = "urgent";
      notifType = "interview_update";
    } else if (roomChanged) {
      studentTitle = "🚨 Interview Room Changed";
      studentMessage = `Your interview room has been changed.\n\nPrevious Room: ${oldRoom}\nNew Room: ${newRoom}\n\nPlease report to the new room.`;
      studentPriority = "urgent";
      notifType = "room_changed";
    } else if (timeChanged) {
      studentTitle = "⚠️ Interview Time Changed";
      studentMessage = `Your interview has been moved from ${oldTime} to ${newTime}.`;
      studentPriority = "high";
      notifType = "time_changed";
    }

    if (studentId) {
      await this.createAndSendNotification({
        recipientId: studentId,
        recipientRole: "student",
        type: notifType,
        title: studentTitle,
        message: studentMessage,
        priority: studentPriority,
        channel: "in_app",
        relatedEntity: { ...entity, interviewId, oldRoom, newRoom, oldTime, newTime },
      });
    }

    if (panelId) {
      await this.createAndSendNotification({
        recipientId: panelId,
        recipientRole: "panel",
        type: notifType,
        title: "Interview Slot / Room Updated",
        message: `Interview with student ${studentId} has been updated: ${newTime} in ${newRoom}.`,
        priority: "high",
        channel: "in_app",
        relatedEntity: { ...entity, interviewId },
      });
    }

    await this.createAndSendNotification({
      recipientId: "TPO",
      recipientRole: "tpo",
      type: "interview_rescheduled",
      title: "Schedule Change Applied",
      message: `Interview ${interviewId} for student ${studentId} was updated to ${newDate} ${newTime} (${newRoom}).`,
      priority: "medium",
      channel: "in_app",
      relatedEntity: { ...entity, interviewId },
    });
  }

  // 3. Interview Cancelled: Notify Student, Panel, TPO
  async handleInterviewCancelled(event) {
    const { entity, payload } = event;
    const studentId = entity?.studentId || payload?.studentId;
    const panelId = entity?.panelId || payload?.panelId;
    const reason = payload?.reason || "Operational adjustment";

    if (studentId) {
      await this.createAndSendNotification({
        recipientId: studentId,
        recipientRole: "student",
        type: "interview_cancelled",
        title: "Interview Cancelled",
        message: `Your scheduled interview has been cancelled. Reason: ${reason}. You will be updated on next steps.`,
        priority: "high",
        channel: "in_app",
        relatedEntity: entity,
      });
    }

    if (panelId) {
      await this.createAndSendNotification({
        recipientId: panelId,
        recipientRole: "panel",
        type: "interview_cancelled",
        title: "Interview Slot Cancelled",
        message: `Interview slot with student ${studentId} cancelled. Reason: ${reason}.`,
        priority: "medium",
        channel: "in_app",
        relatedEntity: entity,
      });
    }

    await this.createAndSendNotification({
      recipientId: "TPO",
      recipientRole: "tpo",
      type: "interview_cancelled",
      title: "Interview Cancelled Notification",
      message: `Interview for student ${studentId} was cancelled. Reason: ${reason}.`,
      priority: "medium",
      channel: "in_app",
      relatedEntity: entity,
    });
  }

  // 4. Candidate Shortlisted: Notify Student & TPO
  async handleCandidateShortlisted(event) {
    const { entity, payload } = event;
    const studentId = entity?.studentId || payload?.studentId;
    const jobId = entity?.jobId || payload?.jobId;
    const role = payload?.role || "the applied position";

    if (studentId) {
      await this.createAndSendNotification({
        recipientId: studentId,
        recipientRole: "student",
        type: "candidate_shortlisted",
        title: "Congratulations! You are Shortlisted",
        message: `You have been shortlisted for ${role}. The scheduling agent is preparing interview slots.`,
        priority: "high",
        channel: "in_app",
        relatedEntity: { ...entity, jobId },
      });
    }

    await this.createAndSendNotification({
      recipientId: "TPO",
      recipientRole: "tpo",
      type: "candidate_shortlisted",
      title: "Candidate Shortlisted",
      message: `Student ${studentId} has been shortlisted for Job ${jobId}.`,
      priority: "low",
      channel: "in_app",
      relatedEntity: { ...entity, jobId },
    });
  }

  // 5. Conflict Detected: Notify TPO ONLY (Strict Rule: Do NOT notify students prematurely!)
  async handleConflictDetected(event) {
    const { entity, payload } = event;
    const conflictId = entity?.conflictId || payload?.conflictId || `CONF_${Date.now()}`;
    const description = payload?.description || "Schedule overlap or panel unavailability detected";

    await this.createAndSendNotification({
      recipientId: "TPO",
      recipientRole: "tpo",
      type: "conflict_detected",
      title: "⚠️ Schedule Conflict Detected",
      message: `Conflict ID ${conflictId}: ${description}. Negotiation Agent has been triggered for resolution proposals.`,
      priority: "urgent",
      channel: "in_app",
      relatedEntity: { ...entity, conflictId },
    });
  }

  // 6. Conflict Resolved: Notify Affected Students, Panel, TPO
  async handleConflictResolved(event) {
    const { entity, payload } = event;
    const studentId = entity?.studentId || payload?.studentId;
    const panelId = entity?.panelId || payload?.panelId;
    const resolution = payload?.resolution || "Schedule updated and confirmed";

    if (studentId) {
      await this.createAndSendNotification({
        recipientId: studentId,
        recipientRole: "student",
        type: "conflict_resolved",
        title: "Interview Schedule Confirmed",
        message: `Your interview timing has been finalized: ${resolution}.`,
        priority: "high",
        channel: "in_app",
        relatedEntity: entity,
      });
    }

    if (panelId) {
      await this.createAndSendNotification({
        recipientId: panelId,
        recipientRole: "panel",
        type: "conflict_resolved",
        title: "Interview Schedule Confirmed",
        message: `Interview timing has been updated and confirmed: ${resolution}.`,
        priority: "medium",
        channel: "in_app",
        relatedEntity: entity,
      });
    }

    await this.createAndSendNotification({
      recipientId: "TPO",
      recipientRole: "tpo",
      type: "conflict_resolved",
      title: "Conflict Resolved",
      message: `Conflict for entity ${entity?.jobId || entity?.interviewId || "Schedule"} resolved: ${resolution}.`,
      priority: "medium",
      channel: "in_app",
      relatedEntity: entity,
    });
  }

  // 7. Interview Reminder: Notify Student & Panel
  async handleInterviewReminder(event) {
    const { entity, payload } = event;
    const studentId = entity?.studentId || payload?.studentId;
    const panelId = entity?.panelId || payload?.panelId;
    const timeRemaining = payload?.timeRemaining || "1 hour";
    const meetingLink = payload?.meetingLink || "";

    if (studentId) {
      await this.createAndSendNotification({
        recipientId: studentId,
        recipientRole: "student",
        type: "interview_reminder",
        title: "⏰ Upcoming Interview Reminder",
        message: `Your interview starts in ${timeRemaining}.${meetingLink ? ` Link: ${meetingLink}` : ""}`,
        priority: "high",
        channel: "in_app",
        relatedEntity: entity,
      });
    }

    if (panelId) {
      await this.createAndSendNotification({
        recipientId: panelId,
        recipientRole: "panel",
        type: "interview_reminder",
        title: "⏰ Interview Reminder",
        message: `Interview with student ${studentId} begins in ${timeRemaining}.`,
        priority: "high",
        channel: "in_app",
        relatedEntity: entity,
      });
    }
  }

  // 8. Offer Received: Notify Student & TPO
  async handleOfferReceived(event) {
    const { entity, payload } = event;
    const studentId = entity?.studentId || payload?.studentId;
    const companyName = payload?.companyName || "Company";
    const role = payload?.role || "Position";

    if (studentId) {
      await this.createAndSendNotification({
        recipientId: studentId,
        recipientRole: "student",
        type: "offer_received",
        title: "🎉 Job Offer Received!",
        message: `Congratulations! You have received a job offer from ${companyName} for the role of ${role}. Please review and respond before deadline.`,
        priority: "urgent",
        channel: "in_app",
        relatedEntity: entity,
      });
    }

    await this.createAndSendNotification({
      recipientId: "TPO",
      recipientRole: "tpo",
      type: "offer_received",
      title: "New Job Offer Issued",
      message: `Offer extended to student ${studentId} by ${companyName} for ${role}.`,
      priority: "medium",
      channel: "in_app",
      relatedEntity: entity,
    });
  }

  // 9. Offer Accepted: Notify Student & TPO (Triggers rematching workflow)
  async handleOfferAccepted(event) {
    const { entity, payload } = event;
    const studentId = entity?.studentId || payload?.studentId;
    const jobId = entity?.jobId || payload?.jobId;
    const companyName = payload?.companyName || "Company";

    if (studentId) {
      await this.createAndSendNotification({
        recipientId: studentId,
        recipientRole: "student",
        type: "offer_accepted",
        title: "Offer Acceptance Confirmed",
        message: `Your acceptance of the offer from ${companyName} is recorded. Congratulations on your placement!`,
        priority: "high",
        channel: "in_app",
        relatedEntity: entity,
      });
    }

    await this.createAndSendNotification({
      recipientId: "TPO",
      recipientRole: "tpo",
      type: "offer_accepted",
      title: "Placement Confirmed - Offer Accepted",
      message: `Student ${studentId} has accepted the offer for Job ${jobId}. Automated rematching & cascade workflow triggered.`,
      priority: "urgent",
      channel: "in_app",
      relatedEntity: entity,
    });
  }

  // 10. Rematch Triggered: Notify TPO and newly affected students
  async handleRematchTriggered(event) {
    const { entity, payload } = event;
    const reason = payload?.reason || "Candidate accepted another offer / slot opened";
    const affectedJobId = entity?.jobId || payload?.jobId;

    await this.createAndSendNotification({
      recipientId: "TPO",
      recipientRole: "tpo",
      type: "rematch_triggered",
      title: "Dynamic Rematching Triggered",
      message: `Dynamic rematching initiated for Job ${affectedJobId}. Reason: ${reason}. Updated candidates are being evaluated.`,
      priority: "high",
      channel: "in_app",
      relatedEntity: entity,
    });
  }

  // 11. Readiness Plan Created: Notify Student
  async handleReadinessPlanCreated(event) {
    const { entity, payload } = event;
    const studentId = entity?.studentId || payload?.studentId;
    const targetRole = payload?.targetRole || "your target role";

    if (studentId) {
      await this.createAndSendNotification({
        recipientId: studentId,
        recipientRole: "student",
        type: "readiness_plan_created",
        title: "Personalized Interview Readiness Plan Ready",
        message: `Your AI coach has generated a preparation plan tailored for ${targetRole} with key skill recommendations.`,
        priority: "medium",
        channel: "in_app",
        relatedEntity: entity,
      });
    }
  }

  // 12. TPO Approval Required: Notify TPO
  async handleTpoApprovalRequired(event) {
    const { entity, payload } = event;
    const actionType = payload?.actionType || "Schedule / Negotiation Proposal";
    const details = payload?.details || "Action requires administrative confirmation";

    await this.createAndSendNotification({
      recipientId: "TPO",
      recipientRole: "tpo",
      type: "tpo_approval_required",
      title: `⚡ Action Required: ${actionType}`,
      message: `${details}. Please approve, reject, or override in the TPO dashboard.`,
      priority: "urgent",
      channel: "in_app",
      relatedEntity: entity,
    });
  }
}

const notificationAgent = new NotificationAgent();
module.exports = notificationAgent;
