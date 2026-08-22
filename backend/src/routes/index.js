const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const studentRoutes = require("./studentRoutes");
const companyRoutes = require("./companyRoutes");
const jobRoutes = require("./jobRoutes");
const resumeRoutes = require("./resumeRoutes");
const applicationRoutes = require("./applicationRoutes");
const eligibilityRoutes = require("./eligibilityRoutes");
const matchingRoutes = require("./matchingRoutes");
const schedulingRoutes = require("./schedulingRoutes");
const negotiationRoutes = require("./negotiationRoutes");
const panelRoutes = require("./panelRoutes");
const roomRoutes = require("./roomRoutes");
const notificationRoutes = require("./notificationRoutes");
const offerRoutes = require("./offerRoutes");
const agentLogRoutes = require("./agentLogRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const orchestratorRoutes = require("./orchestratorRoutes");
const uploadRoutes = require("./uploadRoutes");

// Mount sub-routers
router.use("/auth", authRoutes);
router.use("/student", studentRoutes);
router.use("/students", studentRoutes);
router.use("/companies", companyRoutes);
router.use("/jobs", jobRoutes);
router.use("/resumes", resumeRoutes);
router.use("/applications", applicationRoutes);
router.use("/eligibility", eligibilityRoutes);
router.use("/matching", matchingRoutes);
router.use("/schedules", schedulingRoutes);
router.use("/negotiations", negotiationRoutes);
router.use("/conflicts", negotiationRoutes);
router.use("/panels", panelRoutes);
router.use("/rooms", roomRoutes);
router.use("/notifications", notificationRoutes);
router.use("/offers", offerRoutes);
router.use("/agent-logs", agentLogRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/orchestrator", orchestratorRoutes);
router.use("/upload", uploadRoutes);

module.exports = router;
