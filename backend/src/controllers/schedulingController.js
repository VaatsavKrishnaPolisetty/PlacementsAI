const Interview = require("../models/interview");
const schedulingAdapter = require("../services/adapters/schedulingAdapter");

exports.generateSchedule = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { candidates } = req.body;
    const result = await schedulingAdapter.generateSchedule(jobId, candidates);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getAllInterviews = async (req, res, next) => {
  try {
    const { jobId, studentId, panelId, status, date } = req.query;
    const filter = {};
    if (jobId) filter.jobId = jobId;
    if (studentId) filter.studentId = studentId;
    if (panelId) filter.panelId = panelId;
    if (status) filter.status = status;
    if (date) filter.date = date;

    const interviews = await Interview.find(filter).sort({ date: 1, startTime: 1 });
    return res.status(200).json({ success: true, count: interviews.length, data: interviews });
  } catch (error) {
    next(error);
  }
};

exports.getInterviewsByJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const interviews = await Interview.find({ jobId }).sort({ date: 1, startTime: 1 });
    return res.status(200).json({ success: true, count: interviews.length, data: interviews });
  } catch (error) {
    next(error);
  }
};

exports.getInterviewsByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const interviews = await Interview.find({ studentId }).sort({ date: 1, startTime: 1 });
    return res.status(200).json({ success: true, count: interviews.length, data: interviews });
  } catch (error) {
    next(error);
  }
};

exports.detectConflicts = async (req, res, next) => {
  try {
    const { jobId } = req.query;
    const conflicts = await schedulingAdapter.detectConflicts(jobId || null);
    return res.status(200).json({ success: true, ...conflicts });
  } catch (error) {
    next(error);
  }
};

exports.updateInterviewSlot = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const updated = await schedulingAdapter.updateSchedule(interviewId, req.body);
    return res.status(200).json({ success: true, message: "Interview slot updated", data: updated });
  } catch (error) {
    next(error);
  }
};
