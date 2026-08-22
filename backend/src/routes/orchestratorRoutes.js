const express = require("express");
const router = express.Router();
const orchestratorController = require("../controllers/orchestratorController");

router.post("/pipeline/:jobId", orchestratorController.runPipeline);
router.post("/negotiate", orchestratorController.startNegotiation);
router.post("/approve-proposal", orchestratorController.approveProposal);
router.post("/reject-proposal", orchestratorController.rejectProposal);
router.post("/override-schedule", orchestratorController.overrideSchedule);

module.exports = router;
