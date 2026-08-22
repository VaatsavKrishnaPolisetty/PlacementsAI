const express = require("express");
const router = express.Router();
const matchingController = require("../controllers/matchingController");

router.post("/run", matchingController.runMatching);
router.post("/rematch", matchingController.rematchCandidates);
router.post("/readiness", matchingController.getReadinessPlan);
router.post("/:jobId/run", matchingController.runMatching);
router.get("/:jobId", matchingController.getMatchesByJob);
router.get("/:jobId/:studentId", matchingController.getMatchByJobAndStudent);
router.get("/readiness/:jobId/:studentId", matchingController.getReadinessPlan);

module.exports = router;
