const mongoose = require("mongoose");
const Interview = require("../../models/interview");
const Panel = require("../../models/panel");
const Room = require("../../models/room");
const eventBus = require("../../events/eventBus");
const EventTypes = require("../../events/eventTypes");
const coordinationService = require("../coordinationService");

class NegotiationAdapter {
  constructor() {
    this.externalNegotiationProvider = null;
    this.proposals = new Map(); // Stores active conflict negotiation proposals
  }

  /**
   * Allows Member 4 to plug in their Multi-Party Negotiation & Conflict Resolution Engine
   */
  registerNegotiationProvider(providerFn) {
    if (typeof providerFn === "function") {
      this.externalNegotiationProvider = providerFn;
      console.log("🔌 External Negotiation Provider registered from Member 4");
    }
  }

  /**
   * Start negotiation / generate proposal for a detected conflict
   */
  async startNegotiation(conflictData) {
    const conflictId = conflictData.conflictId || `CONF_${Date.now()}`;

    await eventBus.publish(EventTypes.NEGOTIATION_STARTED, {
      source: "NegotiationAgent",
      message: `Autonomous negotiation started for Conflict ${conflictId}`,
      entity: { conflictId },
      payload: conflictData,
    });

    if (this.externalNegotiationProvider) {
      try {
        const externalProposal = await this.externalNegotiationProvider(conflictData);
        this.proposals.set(conflictId, externalProposal);
        return externalProposal;
      } catch (err) {
        console.warn("⚠️ External negotiation provider failed, using fallback:", err.message);
      }
    }

    const isConnected = mongoose.connection.readyState === 1;

    // Identify target interview
    const targetInterviewId = conflictData.interviews?.[1] || conflictData.interviews?.[0] || conflictData.interviewId;
    let currentInterview = targetInterviewId && isConnected ? await Interview.findOne({ interviewId: targetInterviewId }) : null;
    if (!currentInterview) {
      currentInterview = {
        interviewId: targetInterviewId || `INT_${Date.now()}`,
        studentId: conflictData.studentId || "STU_101",
        panelId: conflictData.panelId || "PANEL_A",
        roomId: conflictData.roomId || "ROOM_204",
        date: conflictData.date || new Date(Date.now() + 86400000).toISOString().split("T")[0],
        startTime: "10:00",
        endTime: "11:00",
      };
    }

    const panels = isConnected ? await Panel.find() : [];
    const rooms = isConnected ? await Room.find() : [];
    const existingInterviews = isConnected ? await Interview.find({ status: { $ne: "cancelled" } }) : [];

    const proposal = coordinationService.formulateNegotiationProposal(
      conflictData,
      currentInterview,
      existingInterviews,
      panels.length ? panels : [{ panelId: "PANEL_A", name: "Technical Panel A" }],
      rooms.length ? rooms : [{ roomId: "ROOM_204", name: "Block A - Room 204" }]
    );

    this.proposals.set(proposal.proposalId, proposal);
    this.proposals.set(conflictId, proposal);

    await eventBus.publish(EventTypes.RESOLUTION_PROPOSED, {
      source: "NegotiationAgent",
      message: `Resolution proposed for Conflict ${conflictId}: Shift interview to ${proposal.recommendedSlot.startTime}-${proposal.recommendedSlot.endTime}`,
      entity: { conflictId, proposalId: proposal.proposalId, studentId: proposal.studentId },
      payload: proposal,
      status: "pending_approval",
    });

    // Notify TPO that approval is required
    await eventBus.publish(EventTypes.TPO_APPROVAL_REQUIRED, {
      source: "NegotiationAgent",
      message: `TPO decision needed on Resolution Proposal ${proposal.proposalId} for Conflict ${conflictId}`,
      entity: { conflictId, proposalId: proposal.proposalId },
      payload: { actionType: "Conflict Resolution Proposal", details: proposal.recommendedSlot.reason || proposal.aiReasoning },
    });

    return proposal;
  }


  /**
   * Retrieve a proposal by ID or conflict ID
   */
  async getProposal(id) {
    return this.proposals.get(id) || null;
  }

  /**
   * Approve a proposal (Human-in-the-loop TPO action)
   */
  async approveProposal(proposalId, tpoId = "TPO_ADMIN") {
    let proposal = this.proposals.get(proposalId);
    if (!proposal) {
      proposal = {
        proposalId,
        status: "approved",
        proposedChanges: { date: new Date().toISOString().split("T")[0], startTime: "15:00", endTime: "16:00" },
      };
    }

    proposal.status = "approved";
    proposal.approvedBy = tpoId;
    proposal.approvedAt = new Date();

    const changeSlot = proposal.recommendedSlot || proposal.proposedChanges || {};

    const isConnected = mongoose.connection.readyState === 1;

    // If target interview exists and DB is connected, update the actual schedule
    if (proposal.targetInterviewId && isConnected) {
      const interview = await Interview.findOne({ interviewId: proposal.targetInterviewId });
      if (interview) {
        interview.date = changeSlot.date || interview.date;
        interview.startTime = changeSlot.startTime || interview.startTime;
        interview.endTime = changeSlot.endTime || interview.endTime;
        if (changeSlot.panelId) interview.panelId = changeSlot.panelId;
        if (changeSlot.roomId) interview.roomId = changeSlot.roomId;
        interview.status = "rescheduled";
        await interview.save();
      }
    }

    await eventBus.publish(EventTypes.TPO_APPROVED, {
      source: "TPO_Action",
      message: `TPO approved proposal ${proposalId}`,
      entity: { proposalId, conflictId: proposal.conflictId },
      payload: proposal,
      status: "success",
    });

    const shiftTime = changeSlot.startTime && changeSlot.endTime
      ? `Slot shifted to ${changeSlot.startTime}-${changeSlot.endTime}`
      : "Slot rescheduled as proposed";

    await eventBus.publish(EventTypes.CONFLICT_RESOLVED, {
      source: "NegotiationAgent",
      message: `Conflict ${proposal.conflictId || proposalId} resolved successfully following TPO approval`,
      entity: {
        proposalId,
        conflictId: proposal.conflictId,
        studentId: proposal.studentId,
        panelId: proposal.panelId,
      },
      payload: {
        resolution: shiftTime,
      },
    });

    return { success: true, proposal };
  }

  /**
   * Reject a proposal (Human-in-the-loop TPO action)
   */
  async rejectProposal(proposalId, reason = "Rejected by TPO", tpoId = "TPO_ADMIN") {
    let proposal = this.proposals.get(proposalId);
    if (!proposal) {
      proposal = { proposalId, status: "rejected" };
    }

    proposal.status = "rejected";
    proposal.rejectedBy = tpoId;
    proposal.rejectionReason = reason;
    proposal.rejectedAt = new Date();

    await eventBus.publish(EventTypes.TPO_REJECTED, {
      source: "TPO_Action",
      message: `TPO rejected proposal ${proposalId}: ${reason}`,
      entity: { proposalId, conflictId: proposal.conflictId },
      payload: proposal,
      status: "warning",
    });

    return { success: true, proposal };
  }
}

const negotiationAdapter = new NegotiationAdapter();
module.exports = negotiationAdapter;
