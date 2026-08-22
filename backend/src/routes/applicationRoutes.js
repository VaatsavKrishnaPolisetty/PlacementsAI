const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");

router.get("/", applicationController.getAllApplications);
router.post("/", applicationController.createApplication);
router.get("/:applicationId", applicationController.getApplicationById);
router.get("/student/:studentId", applicationController.getApplicationsByStudent);
router.get("/job/:jobId", applicationController.getApplicationsByJob);
router.patch("/:applicationId/status", applicationController.updateApplicationStatus);

module.exports = router;
