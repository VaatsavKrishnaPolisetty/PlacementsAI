const Resume = require("../models/resume");
const eventBus = require("../events/eventBus");
const EventTypes = require("../events/eventTypes");

exports.getAllResumes = async (req, res, next) => {
  try {
    const { studentId } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;

    const resumes = await Resume.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: resumes.length, data: resumes });
  } catch (error) {
    next(error);
  }
};

exports.getResumeById = async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const resume = await Resume.findOne({ resumeId });
    if (!resume) {
      return res.status(404).json({ success: false, message: `Resume ${resumeId} not found` });
    }
    return res.status(200).json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
};

exports.getResumeByStudentId = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const resume = await Resume.findOne({ studentId }).sort({ version: -1 });
    if (!resume) {
      return res.status(404).json({ success: false, message: `No resume found for student ${studentId}` });
    }
    return res.status(200).json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
};

exports.createResume = async (req, res, next) => {
  try {
    const resume = await Resume.create(req.body);

    await eventBus.publish(EventTypes.RESUME_UPLOADED, {
      source: "ResumeService",
      message: `Resume uploaded for student ${resume.studentId} (${resume.fileName})`,
      entity: { studentId: resume.studentId, resumeId: resume.resumeId },
      payload: { fileName: resume.fileName, version: resume.version },
    });

    return res.status(201).json({ success: true, message: "Resume saved successfully", data: resume });
  } catch (error) {
    next(error);
  }
};
