const Resume = require("../models/resume");
const Job = require("../models/jobs");
const eventBus = require("../events/eventBus");
const EventTypes = require("../events/eventTypes");

exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No resume file uploaded" });
    }

    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({ success: false, message: "studentId is required" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const resumeId = `RES_${studentId}_${Date.now()}`;

    // Get previous version count
    const prevCount = await Resume.countDocuments({ studentId });
    const version = prevCount + 1;

    const resume = await Resume.create({
      resumeId,
      studentId,
      fileName: req.file.originalname,
      fileUrl,
      version,
      extractedText: "",
      structuredExtraction: {
        skills: req.body.skills ? (Array.isArray(req.body.skills) ? req.body.skills : req.body.skills.split(",")) : [],
      },
    });

    await eventBus.publish(EventTypes.RESUME_UPLOADED, {
      source: "UploadService",
      message: `Resume file '${req.file.originalname}' uploaded for student ${studentId}`,
      entity: { studentId, resumeId },
      payload: { fileName: req.file.originalname, fileUrl, size: req.file.size, version },
    });

    return res.status(201).json({
      success: true,
      message: "Resume uploaded successfully. Dispatched to Member 2 Resume Parser.",
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadJobDescription = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No JD file uploaded" });
    }

    const { jobId } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;

    let job = null;
    if (jobId) {
      job = await Job.findOneAndUpdate(
        { jobId },
        { jdFileUrl: fileUrl },
        { new: true }
      );
    }

    await eventBus.publish(EventTypes.JD_PARSED, {
      source: "UploadService",
      message: `JD file '${req.file.originalname}' uploaded${jobId ? ` for Job ${jobId}` : ""}`,
      entity: { jobId: jobId || "" },
      payload: { fileName: req.file.originalname, fileUrl, size: req.file.size },
    });

    return res.status(201).json({
      success: true,
      message: "Job Description file uploaded successfully. Dispatched to Member 2 JD Parser.",
      fileUrl,
      fileName: req.file.originalname,
      job,
    });
  } catch (error) {
    next(error);
  }
};
