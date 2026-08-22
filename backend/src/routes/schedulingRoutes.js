const express = require("express");
const router = express.Router();
const schedulingController = require("../controllers/schedulingController");

router.get("/", schedulingController.getAllInterviews);
router.post("/generate", (req, res, next) => {
  req.params.jobId = req.body.jobId;
  return schedulingController.generateSchedule(req, res, next);
});
router.post("/generate/:jobId", schedulingController.generateSchedule);
router.get("/interviews", schedulingController.getAllInterviews);
router.get("/job/:jobId", schedulingController.getInterviewsByJob);
router.get("/student/:studentId", schedulingController.getInterviewsByStudent);
router.get("/conflicts", schedulingController.detectConflicts);
router.patch("/interview/:interviewId", schedulingController.updateInterviewSlot);
router.patch("/:interviewId", schedulingController.updateInterviewSlot);

module.exports = router;
