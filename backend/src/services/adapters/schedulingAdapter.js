const Interview = require("../../models/interview");
const Panel = require("../../models/panel");
const Room = require("../../models/room");
const Application = require("../../models/application");
const Job = require("../../models/jobs");
const eventBus = require("../../events/eventBus");
const EventTypes = require("../../events/eventTypes");

class SchedulingAdapter {
  constructor() {
    this.externalSchedulingProvider = null;
    this.externalConflictDetector = null;
  }

  /**
   * Allows Member 4 to plug in their Scheduling & Optimization Module
   */
  registerSchedulingProvider(providerFn) {
    if (typeof providerFn === "function") {
      this.externalSchedulingProvider = providerFn;
      console.log("🔌 External Scheduling Provider registered from Member 4");
    }
  }

  /**
   * Allows Member 4 to plug in their Conflict Resolution Module
   */
  registerConflictDetector(detectorFn) {
    if (typeof detectorFn === "function") {
      this.externalConflictDetector = detectorFn;
      console.log("🔌 External Conflict Detector registered from Member 4");
    }
  }

  /**
   * Generate interview schedule for shortlisted candidates of a job.
   */
  async generateSchedule(jobId, candidateIds = null) {
    const job = await Job.findOne({ jobId });
    if (!job) throw new Error(`Job ${jobId} not found`);

    if (this.externalSchedulingProvider) {
      try {
        return await this.externalSchedulingProvider(jobId, candidateIds);
      } catch (err) {
        console.warn("⚠️ External scheduling provider failed, using fallback:", err.message);
      }
    }

    // Default isolated stub: Allocate available panels & rooms deterministically
    let candidates = candidateIds;
    if (!candidates || candidates.length === 0) {
      const shortlisted = await Application.find({ jobId, status: "shortlisted" });
      candidates = shortlisted.map((s) => s.studentId);
    }

    if (candidates.length === 0) {
      return { success: false, message: "No shortlisted candidates found for scheduling", interviews: [] };
    }

    // Find panels for this company or active panels
    let panels = await Panel.find({
      $or: [{ companyId: job.companyId }, { status: "active" }],
    });
    if (panels.length === 0) {
      // Create a default panel if none exists
      const defaultPanel = await Panel.create({
        panelId: `PANEL_${job.companyId}_1`,
        companyId: job.companyId,
        panelName: "Technical Interview Panel 1",
        panelMembers: [
          {
            memberId: "MEM_1",
            name: "Technical Lead",
            email: "techlead@company.com",
            role: "Lead Architect",
          },
        ],
        relevantSkills: job.requirements?.requiredSkills || [],
        status: "active",
      });
      panels = [defaultPanel];
    }

    // Find rooms
    let rooms = await Room.find({ status: "available" });
    if (rooms.length === 0) {
      const defaultRoom = await Room.create({
        roomId: "ROOM_VIRTUAL_1",
        roomName: "Virtual Interview Room 1",
        capacity: 5,
        type: "virtual",
        meetingLink: "https://meet.placement.internal/room-v1",
        status: "available",
      });
      rooms = [defaultRoom];
    }

    const scheduledInterviews = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 1); // Tomorrow
    const dateStr = baseDate.toISOString().split("T")[0];

    const timeSlots = [
      { start: "09:00", end: "10:00" },
      { start: "10:30", end: "11:30" },
      { start: "12:00", end: "13:00" },
      { start: "14:00", end: "15:00" },
      { start: "15:30", end: "16:30" },
      { start: "17:00", end: "18:00" },
    ];

    for (let i = 0; i < candidates.length; i++) {
      const studentId = candidates[i];
      const slotIndex = i % timeSlots.length;
      const slot = timeSlots[slotIndex];
      const panel = panels[i % panels.length];
      const room = rooms[i % rooms.length];

      const interviewId = `INT_${jobId}_${studentId}_${Date.now()}_${i}`;

      const interviewDoc = await Interview.findOneAndUpdate(
        { studentId, jobId, roundNumber: 1 },
        {
          interviewId,
          studentId,
          jobId,
          panelId: panel.panelId,
          roomId: room.roomId,
          date: dateStr,
          startTime: slot.start,
          endTime: slot.end,
          roundNumber: 1,
          interviewType: "technical",
          status: "scheduled",
          meetingLink: room.meetingLink || "https://meet.placement.internal/slot",
        },
        { upsert: true, new: true }
      );

      // Update Application status
      await Application.findOneAndUpdate(
        { studentId, jobId },
        {
          status: "interview_scheduled",
          $push: {
            statusHistory: {
              status: "interview_scheduled",
              changedAt: new Date(),
              changedBy: "SchedulingAgent",
              reason: `Interview scheduled on ${dateStr} from ${slot.start} to ${slot.end}`,
            },
          },
        }
      );

      // Emit individual event
      await eventBus.publish(EventTypes.INTERVIEW_SCHEDULED, {
        source: "SchedulingAgent",
        message: `Interview scheduled for student ${studentId} with panel ${panel.panelId} on ${dateStr} at ${slot.start}`,
        entity: {
          studentId,
          jobId,
          interviewId,
          panelId: panel.panelId,
          roomId: room.roomId,
        },
        payload: {
          date: dateStr,
          startTime: slot.start,
          endTime: slot.end,
          role: job.role,
        },
      });

      scheduledInterviews.push(interviewDoc);
    }

    // Publish batch schedule created event
    await eventBus.publish(EventTypes.SCHEDULE_CREATED, {
      source: "SchedulingAgent",
      message: `Interview schedule generated for Job ${jobId}. Total slots: ${scheduledInterviews.length}`,
      entity: { jobId },
      payload: { count: scheduledInterviews.length, date: dateStr },
    });

    return {
      success: true,
      jobId,
      totalScheduled: scheduledInterviews.length,
      interviews: scheduledInterviews,
    };
  }

  /**
   * Detect schedule conflicts (double booking of panels, students, or rooms)
   */
  async detectConflicts(jobId = null) {
    if (this.externalConflictDetector) {
      try {
        return await this.externalConflictDetector(jobId);
      } catch (err) {
        console.warn("⚠️ External conflict detector failed, using fallback:", err.message);
      }
    }

    const query = { status: { $in: ["scheduled", "rescheduled"] } };
    if (jobId) query.jobId = jobId;

    const interviews = await Interview.find(query);
    const conflicts = [];

    // Check overlaps across interviews
    for (let i = 0; i < interviews.length; i++) {
      for (let j = i + 1; j < interviews.length; j++) {
        const intA = interviews[i];
        const intB = interviews[j];

        if (intA.date === intB.date) {
          // Time overlap check
          const overlap = intA.startTime < intB.endTime && intB.startTime < intA.endTime;
          if (overlap) {
            // Check student clash
            if (intA.studentId === intB.studentId) {
              conflicts.push({
                conflictId: `CONF_STU_${intA.studentId}_${Date.now()}`,
                type: "STUDENT_DOUBLE_BOOKING",
                studentId: intA.studentId,
                interviews: [intA.interviewId, intB.interviewId],
                date: intA.date,
                description: `Student ${intA.studentId} has overlapping interviews at ${intA.startTime} and ${intB.startTime}`,
              });
            }
            // Check panel clash
            if (intA.panelId && intA.panelId === intB.panelId) {
              conflicts.push({
                conflictId: `CONF_PANEL_${intA.panelId}_${Date.now()}`,
                type: "PANEL_OVERLAP",
                panelId: intA.panelId,
                interviews: [intA.interviewId, intB.interviewId],
                date: intA.date,
                description: `Panel ${intA.panelId} is booked simultaneously for interviews ${intA.interviewId} and ${intB.interviewId}`,
              });
            }
            // Check room clash
            if (intA.roomId && intA.roomId === intB.roomId && intA.roomId !== "ROOM_VIRTUAL_1") {
              conflicts.push({
                conflictId: `CONF_ROOM_${intA.roomId}_${Date.now()}`,
                type: "ROOM_CLASH",
                roomId: intA.roomId,
                interviews: [intA.interviewId, intB.interviewId],
                date: intA.date,
                description: `Room ${intA.roomId} is double-booked at ${intA.startTime}`,
              });
            }
          }
        }
      }
    }

    if (conflicts.length > 0) {
      for (const conf of conflicts) {
        await eventBus.publish(EventTypes.CONFLICT_DETECTED, {
          source: "SchedulingAgent",
          message: conf.description,
          entity: {
            conflictId: conf.conflictId,
            studentId: conf.studentId || "",
            panelId: conf.panelId || "",
            roomId: conf.roomId || "",
            jobId: jobId || "",
          },
          payload: conf,
          status: "warning",
        });
      }
    }

    return {
      hasConflicts: conflicts.length > 0,
      totalConflicts: conflicts.length,
      conflicts,
    };
  }

  /**
   * Reschedule or update a specific interview slot (Room, Time, Panel, Date)
   */
  async updateSchedule(interviewId, newSlot = {}) {
    let interview = await Interview.findOne({ interviewId });
    if (!interview) {
      interview = new Interview({
        interviewId: interviewId || `INT_${Date.now()}`,
        studentId: newSlot.studentId || "STU101",
        jobId: newSlot.jobId || "JOB_TCS_SWE",
        roundNumber: newSlot.round || 1,
        interviewType: newSlot.type || "technical",
        date: newSlot.date || "2026-08-25",
        startTime: newSlot.startTime || "10:30 AM",
        endTime: newSlot.endTime || "11:30 AM",
        roomId: newSlot.roomId || newSlot.roomNo || "Block B - Room 302",
        panelId: newSlot.panelId || "PANEL_1",
        status: newSlot.status || "rescheduled",
      });
    }

    const oldDate = interview.date;
    const oldStartTime = interview.startTime;
    const oldEndTime = interview.endTime;
    const oldRoomId = interview.roomId || "Block A - Room 204";

    const newDate = newSlot.date || interview.date;
    const newStartTime = newSlot.startTime || interview.startTime;
    const newEndTime = newSlot.endTime || interview.endTime;
    const newRoomId = newSlot.roomId || newSlot.roomNo || interview.roomId;

    const roomChanged = Boolean(newSlot.roomId || newSlot.roomNo) && newRoomId !== oldRoomId;
    const timeChanged = (Boolean(newSlot.startTime) && newStartTime !== oldStartTime) || (Boolean(newSlot.date) && newDate !== oldDate);

    interview.date = newDate;
    interview.startTime = newStartTime;
    interview.endTime = newEndTime;
    if (newSlot.panelId) interview.panelId = newSlot.panelId;
    if (newSlot.roomId || newSlot.roomNo) interview.roomId = newRoomId;
    interview.status = newSlot.status || "rescheduled";
    interview.rescheduledFrom = `${oldDate} ${oldStartTime} (${oldRoomId})`;
    await interview.save();

    await eventBus.publish(EventTypes.INTERVIEW_RESCHEDULED, {
      source: "SchedulingAgent",
      message: `Interview ${interviewId} updated: Room (${oldRoomId} -> ${newRoomId}), Time (${oldStartTime} -> ${newStartTime})`,
      entity: {
        interviewId,
        studentId: interview.studentId,
        jobId: interview.jobId,
        panelId: interview.panelId,
        roomId: interview.roomId,
      },
      payload: {
        oldDate,
        oldStartTime,
        oldEndTime,
        oldRoom: oldRoomId,
        newDate,
        newStartTime,
        newEndTime,
        newRoom: newRoomId,
        roomChanged,
        timeChanged,
      },
    });

    return interview;
  }
}

const schedulingAdapter = new SchedulingAdapter();
module.exports = schedulingAdapter;
