const EligibilityResult = require("../models/eligibilityResult");
const eligibilityAdapter = require("../services/adapters/eligibilityAdapter");

exports.checkSingleEligibility = async (req, res, next) => {
  try {
    const { studentId, jobId } = req.body;
    if (!studentId || !jobId) {
      return res.status(400).json({ success: false, message: "studentId and jobId are required" });
    }

    const result = await eligibilityAdapter.checkEligibility(studentId, jobId);
    return res.status(200).json({ success: true, message: "Eligibility evaluation completed", data: result });
  } catch (error) {
    next(error);
  }
};

exports.runBatchEligibility = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    if (!jobId) {
      return res.status(400).json({ success: false, message: "jobId is required" });
    }

    const results = await eligibilityAdapter.checkBatchEligibility(jobId);
    return res.status(200).json({
      success: true,
      message: `Batch eligibility check completed for Job ${jobId}`,
      totalEvaluated: results.length,
      eligibleCount: results.filter((r) => r.eligible).length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

exports.getEligibilityByJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const results = await EligibilityResult.find({ jobId });
    return res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    next(error);
  }
};

exports.getEligibilityByStudentAndJob = async (req, res, next) => {
  try {
    const { jobId, studentId } = req.params;
    let result = await EligibilityResult.findOne({ jobId, studentId });
    if (!result) {
      result = await eligibilityAdapter.checkEligibility(studentId, jobId);
    }
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
