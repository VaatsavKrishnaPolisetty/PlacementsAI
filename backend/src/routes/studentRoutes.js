const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const upload = require("../middleware/upload");

router.get("/profile", studentController.getProfile);
router.put("/profile", studentController.updateProfile);
router.post("/resume", upload.single("resume"), studentController.uploadResumeFile);
router.delete("/resume", studentController.deleteResumeFile);

router.get("/", studentController.getAllStudents);
router.post("/", studentController.createStudent);
router.get("/:studentId", studentController.getStudentById);
router.patch("/:studentId", studentController.updateStudent);
router.delete("/:studentId", studentController.deleteStudent);

module.exports = router;
