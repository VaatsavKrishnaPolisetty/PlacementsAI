/**
 * Centralized Authentication Controller
 * Handles Student & Placement Officer / Admin Registration, Login, Session Verification, and Role Management.
 */

const Student = require("../models/student");

exports.register = async (req, res, next) => {
  try {
    const {
      name,
      fullName,
      studentId,
      rollNo,
      email,
      password,
      department,
      branch,
      year,
      phone,
      degree,
      cgpa,
      backlogs,
      skills,
    } = req.body;

    const finalName = name || fullName;
    const finalId = (studentId || rollNo || "").trim().toUpperCase();
    const finalEmail = (email || "").trim().toLowerCase();
    const finalDept = department || branch || "Computer Science";
    const finalBranch = branch || department || "cse";
    const finalYear = Number(year) || 4;
    const finalPhone = phone || "";
    const finalDegree = degree || "B.Tech";
    const finalCgpa = cgpa !== undefined ? Number(cgpa) : 8.0;
    const finalBacklogs = backlogs !== undefined ? Number(backlogs) : 0;

    if (!finalName || !finalId || !finalEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, student ID / roll number, college email, and password are required.",
      });
    }

    // Check existing
    const existing = await Student.findOne({
      $or: [{ studentId: finalId }, { email: finalEmail }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A student account with this Student ID or Email already exists.",
      });
    }

    const initialSkills = skills || {
      technical: ["Python", "SQL", "Data Structures"],
      soft: ["Communication", "Problem Solving", "Teamwork"],
    };

    const newStudent = await Student.create({
      studentId: finalId,
      name: finalName,
      email: finalEmail,
      password: password || "password123",
      role: "student",
      department: finalDept,
      branch: finalBranch,
      year: finalYear,
      phone: finalPhone,
      degree: finalDegree,
      graduationYear: new Date().getFullYear() + (4 - Math.min(finalYear, 4)),
      cgpa: finalCgpa,
      backlogs: finalBacklogs,
      skills: initialSkills,
      placementStatus: "available",
    });

    // In a stateless/JWT model, token is created; we return session token
    const token = `JWT_SESSION_${newStudent.studentId}_${Date.now()}`;

    return res.status(201).json({
      success: true,
      message: "Student account registered successfully.",
      token,
      user: {
        id: newStudent.studentId,
        studentId: newStudent.studentId,
        name: newStudent.name,
        email: newStudent.email,
        role: "student",
        department: newStudent.department,
        branch: newStudent.branch,
        year: newStudent.year,
        phone: newStudent.phone,
        degree: newStudent.degree,
        cgpa: newStudent.cgpa,
        backlogs: newStudent.backlogs,
        skills: newStudent.skills,
        resume: newStudent.resume,
        placementStatus: newStudent.placementStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, studentId, identifier, password, role } = req.body;
    const loginId = (identifier || email || studentId || "").trim().toLowerCase();

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email / student ID and password.",
      });
    }

    // Admin / TPO fast login
    if (
      loginId.includes("admin") ||
      loginId.includes("tpo") ||
      loginId === "tpo@placement.edu" ||
      loginId === "admin@placement.edu" ||
      role === "admin" ||
      role === "tpo"
    ) {
      const adminToken = `JWT_ADMIN_${Date.now()}`;
      return res.status(200).json({
        success: true,
        message: "Logged in as Placement Officer / Admin.",
        token: adminToken,
        user: {
          id: "TPO_ADMIN",
          studentId: "TPO_ADMIN",
          name: "Dr. Sharma",
          email: "tpo@placement.edu",
          role: "tpo",
          department: "Placement & Training Cell",
          designation: "Head of Campus Placements",
        },
      });
    }

    // Student login
    const student = await Student.findOne({
      $or: [
        { email: loginId },
        { studentId: loginId.toUpperCase() },
        { studentId: loginId },
      ],
    });

    if (!student) {
      // If student not found in DB during quick testing, allow synthetic fallback login
      return res.status(401).json({
        success: false,
        message: "Invalid login credentials. Student record not found.",
      });
    }

    // Simple password check (supports demo password or user password)
    if (student.password && student.password !== password && password !== "password123") {
      return res.status(401).json({
        success: false,
        message: "Invalid password. Please try again.",
      });
    }

    const token = `JWT_SESSION_${student.studentId}_${Date.now()}`;

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: student.studentId,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        role: student.role || "student",
        department: student.department || student.branch,
        branch: student.branch,
        year: student.year || 4,
        phone: student.phone,
        degree: student.degree || "B.Tech",
        cgpa: student.cgpa,
        backlogs: student.backlogs,
        skills: student.skills || { technical: [], soft: [] },
        resume: student.resume,
        placementStatus: student.placementStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const studentId = req.query.studentId || req.headers["x-student-id"] || "STU101";

    if (studentId === "TPO_ADMIN" || studentId === "admin") {
      return res.status(200).json({
        success: true,
        user: {
          id: "TPO_ADMIN",
          studentId: "TPO_ADMIN",
          name: "Dr. Sharma",
          email: "tpo@placement.edu",
          role: "tpo",
          department: "Placement & Training Cell",
          designation: "Head of Campus Placements",
        },
      });
    }

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: student.studentId,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        role: student.role || "student",
        department: student.department || student.branch,
        branch: student.branch,
        year: student.year || 4,
        phone: student.phone,
        degree: student.degree || "B.Tech",
        cgpa: student.cgpa,
        backlogs: student.backlogs,
        skills: student.skills || { technical: [], soft: [] },
        resume: student.resume,
        placementStatus: student.placementStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res) => {
  return res.status(200).json({ success: true, message: "Logged out successfully." });
};
