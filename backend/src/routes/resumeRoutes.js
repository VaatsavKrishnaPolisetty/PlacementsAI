const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resumeController");

router.get("/", resumeController.getAllResumes);
router.post("/", resumeController.createResume);
router.get("/:resumeId", resumeController.getResumeById);
router.get("/student/:studentId", resumeController.getResumeByStudentId);

module.exports = router;
