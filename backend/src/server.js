const http = require("http");
const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

dotenv.config();

const connectDatabase = require("./config/database");
const socketService = require("./services/socketService");
const notificationAgent = require("./agents/notification/notificationAgent");
const placementOrchestrator = require("./orchestrator/placementOrchestrator");
const apiRoutes = require("./routes/index");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const httpServer = http.createServer(app);

const PORT = process.env.PORT || 5000;

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  },
});

// Initialize Socket.io service
socketService.init(io);

// Initialize Autonomous Agents
notificationAgent.init();
placementOrchestrator.init();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Campus Placement Operations Backend",
    healthCheck: "/api/health",
    endpoints: {
      students: "/api/students",
      companies: "/api/companies",
      jobs: "/api/jobs",
      resumes: "/api/resumes",
      applications: "/api/applications",
      eligibility: "/api/eligibility",
      matching: "/api/matching",
      schedules: "/api/schedules",
      panels: "/api/panels",
      rooms: "/api/rooms",
      notifications: "/api/notifications",
      offers: "/api/offers",
      agentLogs: "/api/agent-logs",
      analytics: "/api/analytics",
      orchestrator: "/api/orchestrator",
      upload: "/api/upload",
    },
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Placement backend is running",
    service: "AI Campus Placement Operations Agent",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Mount all API routes
app.use("/api", apiRoutes);

// Centralized error handling middleware
app.use(errorHandler);

// Start server only after database connection
const startServer = async () => {
  try {
    await connectDatabase();

    httpServer.listen(PORT, () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
      console.log(`❤️ Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

// Export app and server for testing
module.exports = { app, httpServer, io };

if (require.main === module) {
  startServer();
}