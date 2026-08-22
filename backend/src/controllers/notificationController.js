const Notification = require("../models/notification");
const notificationAgent = require("../agents/notification/notificationAgent");

exports.getAllNotifications = async (req, res, next) => {
  try {
    const { recipientId, role, isRead, type } = req.query;
    const filter = {};
    if (recipientId) filter.recipientId = recipientId;
    if (role) filter.recipientRole = role;
    if (isRead !== undefined) filter.isRead = isRead === "true";
    if (type) filter.type = type;

    const notifications = await Notification.find(filter).sort({ sentAt: -1 });
    return res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    next(error);
  }
};

exports.getNotificationsByRecipient = async (req, res, next) => {
  try {
    const { recipientId } = req.params;
    const notifications = await Notification.find({ recipientId }).sort({ sentAt: -1 });
    return res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    next(error);
  }
};

exports.getNotificationsByRole = async (req, res, next) => {
  try {
    const { role } = req.params;
    const notifications = await Notification.find({ recipientRole: role }).sort({ sentAt: -1 });
    return res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { notificationId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: `Notification ${notificationId} not found` });
    }
    return res.status(200).json({ success: true, message: "Marked as read", data: notification });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const { recipientId } = req.params;
    await Notification.updateMany(
      { recipientId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return res.status(200).json({ success: true, message: `All notifications marked as read for ${recipientId}` });
  } catch (error) {
    next(error);
  }
};

exports.sendManualNotification = async (req, res, next) => {
  try {
    const notification = await notificationAgent.createAndSendNotification(req.body);
    return res.status(201).json({ success: true, message: "Notification sent", data: notification });
  } catch (error) {
    next(error);
  }
};
