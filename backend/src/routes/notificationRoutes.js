const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.get("/", notificationController.getAllNotifications);
router.get("/user/:recipientId", notificationController.getNotificationsByRecipient);
router.get("/role/:role", notificationController.getNotificationsByRole);
router.patch("/:notificationId/read", notificationController.markAsRead);
router.patch("/mark-all-read/:recipientId", notificationController.markAllAsRead);
router.post("/send", notificationController.sendManualNotification);

module.exports = router;
