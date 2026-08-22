const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");

router.get("/", jobController.getAllJobs);
router.post("/", jobController.createJob);
router.post("/parse", jobController.parseJobDescription);
router.get("/:jobId", jobController.getJobById);
router.patch("/:jobId", jobController.updateJob);
router.post("/:jobId/parse", jobController.parseJobDescription);

module.exports = router;

