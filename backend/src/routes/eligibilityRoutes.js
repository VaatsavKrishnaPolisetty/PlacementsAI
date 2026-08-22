const express = require("express");
const router = express.Router();
const eligibilityController = require("../controllers/eligibilityController");

router.post("/check", eligibilityController.checkSingleEligibility);
router.post("/batch/:jobId", eligibilityController.runBatchEligibility);
router.get("/:jobId", eligibilityController.getEligibilityByJob);
router.get("/:jobId/:studentId", eligibilityController.getEligibilityByStudentAndJob);

module.exports = router;
