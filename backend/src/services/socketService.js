class SocketService {
  constructor() {
    this.io = null;
  }

  init(ioInstance) {
    this.io = ioInstance;

    this.io.on("connection", (socket) => {
      console.log(`🔌 Socket connected: ${socket.id}`);

      // Client can join user-specific or role-specific rooms
      socket.on("join_room", (roomName) => {
        if (roomName && typeof roomName === "string") {
          socket.join(roomName);
          console.log(`📡 Socket ${socket.id} joined room: ${roomName}`);
        }
      });

      socket.on("leave_room", (roomName) => {
        if (roomName && typeof roomName === "string") {
          socket.leave(roomName);
          console.log(`📡 Socket ${socket.id} left room: ${roomName}`);
        }
      });

      socket.on("disconnect", () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
      });
    });
  }

  // Send to specific recipient room (e.g. user_STU001 or recipientId directly)
  sendToUser(recipientId, eventName, data) {
    if (!this.io) return;
    this.io.to(recipientId).to(`user_${recipientId}`).emit(eventName, data);
  }

  // Send to role room (e.g., role_student, role_tpo, role_panel)
  sendToRole(role, eventName, data) {
    if (!this.io) return;
    this.io.to(`role_${role}`).to(role).emit(eventName, data);
  }

  // Broadcast agent activity to all clients and agent_logs room
  broadcastAgentActivity(activityData) {
    if (!this.io) return;
    this.io.emit("agent_activity", activityData);
    this.io.to("agent_logs").emit("agent_activity", activityData);
  }

  // Broadcast real-time notifications
  broadcastNotification(notification) {
    if (!this.io) return;
    const recipientId = notification.recipientId;
    const recipientRole = notification.recipientRole;

    // Send to recipient's personal room
    this.io.to(recipientId).to(`user_${recipientId}`).emit("new_notification", notification);

    // Send to role room
    if (recipientRole) {
      this.io.to(`role_${recipientRole}`).emit("role_notification", notification);
    }

    // Always emit general notification event
    this.io.emit("notification_received", notification);
  }

  // Broadcast schedule changes
  broadcastScheduleUpdate(scheduleData) {
    if (!this.io) return;
    this.io.emit("schedule_updated", scheduleData);
  }

  // Broadcast conflict detection & resolution
  broadcastConflictUpdate(conflictData) {
    if (!this.io) return;
    this.io.to("role_tpo").to("tpo_room").emit("conflict_update", conflictData);
    this.io.emit("conflict_status_changed", conflictData);
  }

  // Broadcast offer cascade & rematching events
  broadcastOfferCascade(cascadeData) {
    if (!this.io) return;
    this.io.emit("offer_cascade_update", cascadeData);
  }

  // Generic broadcast
  broadcast(eventName, data) {
    if (!this.io) return;
    this.io.emit(eventName, data);
  }
}

const socketService = new SocketService();
module.exports = socketService;
