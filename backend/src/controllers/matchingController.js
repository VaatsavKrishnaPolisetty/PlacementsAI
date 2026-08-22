const Match = require("../models/match");
const Job = require("../models/jobs");
const Student = require("../models/student");
const ReadinessPlan = require("../models/readinessPlan");
const matchingAdapter = require("../services/adapters/matchingAdapter");
const matchingService = require("../services/matchingService");

exports.runMatching = async (req, res, next) => {
  try {
    const jobId = req.params.jobId || req.body.jobId || (req.body.job && req.body.job.jobId);
    const { weights, students, job } = req.body;

    // Direct in-memory matching if raw objects supplied (Member 3 API contract compatibility)
    if (Array.isArray(students) && job) {
      const results = students.map((st) =>
        matchingService.evaluateCandidateMatch(st, job, null, weights || matchingService.DEFAULT_MATCH_WEIGHTS)
      ).sort((a, b) => b.matchScore - a.matchScore);

      return res.status(200).json({
        success: true,
        totalMatches: results.length,
        candidates: results,
        data: results,
      });
    }

    if (!jobId) {
      return res.status(400).json({ success: false, message: "jobId is required" });
    }

    const matches = await matchingAdapter.runMatching(jobId, weights);
    return res.status(200).json({
      success: true,
      message: `Matching completed for Job ${jobId}`,
      totalMatches: matches.length,
      shortlistedCount: matches.filter((m) => m.matchScore >= 65).length,
      candidates: matches,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMatchesByJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    let matches = await Match.find({ jobId }).sort({ matchScore: -1 });
    if (matches.length === 0) {
      // Auto-run if first query
      matches = await matchingAdapter.runMatching(jobId);
    }
    return res.status(200).json({ success: true, count: matches.length, data: matches });
  } catch (error) {
    next(error);
  }
};

exports.getMatchByJobAndStudent = async (req, res, next) => {
  try {
    const { jobId, studentId } = req.params;
    const match = await matchingAdapter.getMatch(jobId, studentId);
    if (!match) {
      return res.status(404).json({ success: false, message: `Match not found for ${studentId} on ${jobId}` });
    }
    return res.status(200).json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
};

exports.getReadinessPlan = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || req.body.studentId;
    const jobId = req.params.jobId || req.body.jobId;

    let plan = await ReadinessPlan.findOne({ studentId, jobId });
    if (!plan) {
      // Auto-generate if missing
      const match = await Match.findOne({ studentId, jobId });
      const job = await Job.findOne({ jobId });
      plan = await matchingAdapter.generateReadinessPlan(
        studentId,
        jobId,
        match?.skillGaps || [],
        job?.role || "Software Engineer"
      );
    }
    return res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

exports.rematchCandidates = async (req, res, next) => {
  try {
    const { jobId, unavailableStudentId, students, job, weights } = req.body;

    if (Array.isArray(students) && job && unavailableStudentId) {
      const rematchResult = matchingService.rematchCandidatesList(students, job, unavailableStudentId, weights);
      return res.status(200).json({ success: true, ...rematchResult });
    }

    if (!jobId || !unavailableStudentId) {
      return res.status(400).json({ success: false, message: "jobId and unavailableStudentId are required" });
    }

    // Load from database
    const dbJob = await Job.findOne({ jobId });
    if (!dbJob) return res.status(404).json({ success: false, message: `Job ${jobId} not found` });

    const allStudents = await Student.find({ placementStatus: { $ne: "placed" } });
    const rematchResult = matchingService.rematchCandidatesList(allStudents, dbJob, unavailableStudentId, weights);

    return res.status(200).json({ success: true, ...rematchResult });
  } catch (error) {
    next(error);
  }
};
