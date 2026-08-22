const placementOrchestrator = require("../orchestrator/placementOrchestrator");
const negotiationAdapter = require("../services/adapters/negotiationAdapter");
const schedulingAdapter = require("../services/adapters/schedulingAdapter");
const eventBus = require("../events/eventBus");
const EventTypes = require("../events/eventTypes");

exports.runPipeline = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const result = await placementOrchestrator.runJobCampaignPipeline(jobId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.startNegotiation = async (req, res, next) => {
  try {
    const proposal = await negotiationAdapter.startNegotiation(req.body);
    return res.status(200).json({ success: true, message: "Negotiation started and proposal generated", data: proposal });
  } catch (error) {
    next(error);
  }
};

exports.approveProposal = async (req, res, next) => {
  try {
    const { proposalId, tpoId } = req.body;
    if (!proposalId) {
      return res.status(400).json({ success: false, message: "proposalId is required" });
    }
    const result = await negotiationAdapter.approveProposal(proposalId, tpoId || "TPO_ADMIN");
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.rejectProposal = async (req, res, next) => {
  try {
    const { proposalId, reason, tpoId } = req.body;
    if (!proposalId) {
      return res.status(400).json({ success: false, message: "proposalId is required" });
    }
    const result = await negotiationAdapter.rejectProposal(proposalId, reason, tpoId || "TPO_ADMIN");
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.overrideSchedule = async (req, res, next) => {
  try {
    const { interviewId, newDate, newStartTime, newEndTime, panelId, roomId, reason, tpoId } = req.body;
    if (!interviewId) {
      return res.status(400).json({ success: false, message: "interviewId is required" });
    }

    const updated = await schedulingAdapter.updateSchedule(interviewId, {
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      panelId,
      roomId,
    });

    // Log TPO Human Override action
    await eventBus.publish(EventTypes.SCHEDULE_UPDATED, {
      source: "TPO_Action",
      message: `TPO manual override applied on Interview ${interviewId}: ${reason || "Manual adjustment"} by ${tpoId || "TPO"}`,
      entity: { interviewId, panelId, roomId },
      payload: { reason, newDate, newStartTime, newEndTime, tpoId: tpoId || "TPO_ADMIN" },
      status: "success",
    });

    return res.status(200).json({ success: true, message: "TPO override applied successfully", data: updated });
  } catch (error) {
    next(error);
  }
};
