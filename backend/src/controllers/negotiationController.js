const negotiationAdapter = require("../services/adapters/negotiationAdapter");
const schedulingAdapter = require("../services/adapters/schedulingAdapter");

exports.startNegotiation = async (req, res, next) => {
  try {
    const conflictData = {
      conflictId: req.params.conflictId || req.body.conflictId,
      ...req.body,
    };
    const proposal = await negotiationAdapter.startNegotiation(conflictData);
    return res.status(200).json({ success: true, data: proposal });
  } catch (error) {
    next(error);
  }
};

exports.getProposal = async (req, res, next) => {
  try {
    const id = req.params.proposalId || req.params.id;
    const proposal = await negotiationAdapter.getProposal(id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: `Negotiation proposal ${id} not found` });
    }
    return res.status(200).json({ success: true, data: proposal });
  } catch (error) {
    next(error);
  }
};

exports.getAllProposals = async (req, res, next) => {
  try {
    const proposals = Array.from(negotiationAdapter.proposals.values());
    const unique = Array.from(new Map(proposals.map((p) => [p.proposalId, p])).values());
    return res.status(200).json({ success: true, count: unique.length, data: unique });
  } catch (error) {
    next(error);
  }
};

exports.approveProposal = async (req, res, next) => {
  try {
    const proposalId = req.params.proposalId || req.params.id;
    const tpoId = req.body.approvedBy || req.body.tpoId || "TPO_ADMIN";
    const result = await negotiationAdapter.approveProposal(proposalId, tpoId);
    return res.status(200).json({ success: true, message: "Proposal approved and schedule updated", ...result });
  } catch (error) {
    next(error);
  }
};

exports.rejectProposal = async (req, res, next) => {
  try {
    const proposalId = req.params.proposalId || req.params.id;
    const reason = req.body.reason || "Rejected by TPO";
    const tpoId = req.body.rejectedBy || req.body.tpoId || "TPO_ADMIN";
    const result = await negotiationAdapter.rejectProposal(proposalId, reason, tpoId);
    return res.status(200).json({ success: true, message: "Proposal rejected", ...result });
  } catch (error) {
    next(error);
  }
};

exports.detectConflicts = async (req, res, next) => {
  try {
    const { jobId } = req.query;
    const result = await schedulingAdapter.detectConflicts(jobId || null);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
