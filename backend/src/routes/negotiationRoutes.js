const express = require("express");
const router = express.Router();
const negotiationController = require("../controllers/negotiationController");

router.get("/", negotiationController.getAllProposals);
router.post("/start", negotiationController.startNegotiation);
router.post("/:conflictId/start", negotiationController.startNegotiation);
router.get("/conflicts", negotiationController.detectConflicts);
router.get("/:proposalId", negotiationController.getProposal);
router.post("/:proposalId/approve", negotiationController.approveProposal);
router.post("/:proposalId/reject", negotiationController.rejectProposal);

module.exports = router;
