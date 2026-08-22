const express = require("express");
const router = express.Router();
const agentLogController = require("../controllers/agentLogController");

router.get("/", agentLogController.getAllLogs);
router.get("/:eventId", agentLogController.getLogByEventId);

module.exports = router;
