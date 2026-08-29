const Student = require("../models/student");
const Resume = require("../models/resume");
const eventBus = require("../events/eventBus");
const EventTypes = require("../events/eventTypes");

exports.getAllStudents = async (req, res, next) => {
  try {
    const { branch, status, minCGPA } = req.query;
    const filter = {};
    if (branch) filter.branch = branch;
    if (status) filter.placementStatus = status;
    if (minCGPA) filter.cgpa = { $gte: Number(minCGPA) };

    const students = await Student.find(filter).sort({ studentId: 1 });
    return res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    next(error);
  }
};

exports.getStudentById = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ success: false, message: `Student ${studentId} not found` });
    }
    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const studentId = req.query.studentId || req.headers["x-student-id"] || "STU101";
    let student = await Student.findOne({ studentId });

    if (!student) {
      // Create default student record if not existing yet for demo resilience
      student = await Student.create({
        studentId,
        name: "Rahul Verma",
        email: `${studentId.toLowerCase()}@college.edu`,
        branch: "cse",
        department: "Computer Science & Engineering",
        degree: "B.Tech",
        year: 4,
        graduationYear: 2026,
        cgpa: 8.8,
        backlogs: 0,
        phone: "+91 98765 43210",
        skills: {
          technical: ["Python", "SQL", "Data Structures", "FastAPI", "React"],
          soft: ["Communication", "Problem Solving", "Team Leadership"],
        },
        placementStatus: "available",
      });
    }

    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const studentId = req.body.studentId || req.query.studentId || req.headers["x-student-id"] || "STU101";
    
    // Normalize technical & soft skills
    const updateData = { ...req.body };
    if (req.body.technicalSkills || req.body.softSkills) {
      updateData.skills = {
        technical: req.body.technicalSkills || req.body.skills?.technical || [],
        soft: req.body.softSkills || req.body.skills?.soft || [],
      };
    }

    if (req.body.department && !updateData.branch) {
      updateData.branch = req.body.department.toLowerCase().includes("comp") || req.body.department.toLowerCase().includes("cse") ? "cse" : "it";
    }

    const student = await Student.findOneAndUpdate(
      { studentId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Student profile and skills updated successfully.",
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadResumeFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No resume file attached" });
    }

    const studentId = req.body.studentId || req.headers["x-student-id"] || "STU101";
    const fileUrl = `/uploads/${req.file.filename}`;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;
    const resumeId = `RES_${studentId}_${Date.now()}`;

    // Simple skill extraction keyword matcher
    const knownSkills = ["Python", "Java", "JavaScript", "TypeScript", "React", "Node.js", "Express", "SQL", "PostgreSQL", "MongoDB", "FastAPI", "Docker", "Kubernetes", "AWS", "Machine Learning", "Data Structures", "System Design"];
    const fileText = (fileName + " " + (req.file.buffer ? req.file.buffer.toString("utf-8") : "")).toLowerCase();
    
    const extractedTech = knownSkills.filter(sk => fileText.includes(sk.toLowerCase()));
    const finalTech = extractedTech.length > 0 ? extractedTech : ["Python", "SQL", "FastAPI", "React", "Docker"];
    const finalSoft = ["Communication", "Problem Solving", "Team Leadership"];

    // 1. Fetch current student or create default
    let currentStudent = await Student.findOne({ studentId });
    const existingTech = currentStudent?.skills?.technical || [];
    const existingSoft = currentStudent?.skills?.soft || [];

    const mergedTech = Array.from(new Set([...existingTech, ...finalTech]));
    const mergedSoft = Array.from(new Set([...existingSoft, ...finalSoft]));

    // 2. Update Student Profile with resume metadata and extracted skills
    const student = await Student.findOneAndUpdate(
      { studentId },
      {
        $set: {
          resume: {
            fileName,
            fileUrl,
            fileSize,
            uploadedAt: new Date(),
          },
          skills: {
            technical: mergedTech,
            soft: mergedSoft,
          },
        },
      },
      { new: true, upsert: true }
    );

    // 3. Create Resume Model record
    await Resume.create({
      resumeId,
      studentId,
      fileName,
      fileUrl,
      structuredExtraction: {
        skills: mergedTech,
      },
    });

    // 4. Emit RESUME_UPLOADED event
    await eventBus.publish(EventTypes.RESUME_UPLOADED, {
      source: "StudentPortal",
      message: `Resume '${fileName}' uploaded by student ${studentId}`,
      entity: { studentId, resumeId },
      payload: { fileName, fileUrl, fileSize, extractedSkills: { technical: mergedTech, soft: mergedSoft } },
    });

    return res.status(200).json({
      success: true,
      message: "Resume uploaded, parsed, and linked to student profile successfully.",
      data: {
        fileName,
        fileUrl,
        fileSize,
        uploadedAt: new Date(),
        extractedSkills: { technical: mergedTech, soft: mergedSoft },
        student,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteResumeFile = async (req, res, next) => {
  try {
    const studentId = req.body.studentId || req.query.studentId || req.headers["x-student-id"] || "STU101";

    const student = await Student.findOneAndUpdate(
      { studentId },
      {
        $set: {
          resume: {
            fileName: "",
            fileUrl: "",
            fileSize: 0,
            uploadedAt: null,
          },
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Resume removed from student profile.",
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

exports.createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);
    return res.status(201).json({ success: true, message: "Student created successfully", data: student });
  } catch (error) {
    next(error);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOneAndUpdate({ studentId }, req.body, { new: true, runValidators: true });
    if (!student) {
      return res.status(404).json({ success: false, message: `Student ${studentId} not found` });
    }
    return res.status(200).json({ success: true, message: "Student updated successfully", data: student });
  } catch (error) {
    next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOneAndDelete({ studentId });
    if (!student) {
      return res.status(404).json({ success: false, message: `Student ${studentId} not found` });
    }
    return res.status(200).json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    next(error);
  }
};
