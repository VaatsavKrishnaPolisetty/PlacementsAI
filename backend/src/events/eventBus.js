const EventEmitter = require("events");
const AgentLog = require("../models/agentLog");
const socketService = require("../services/socketService");

class EventBus extends EventEmitter {
  constructor() {
    super();
    // Allow high number of listeners for various agents and microservices
    this.setMaxListeners(50);
  }

  /**
   * Publish an event to the system.
   * Standardizes the payload, persists in AgentLog, and notifies sockets.
   * @param {string} eventType - The event name from EventTypes
   * @param {object} eventData - Event details { source, entity, payload, status, message, ... }
   */
  async publish(eventType, eventData = {}) {
    const eventId =
      eventData.eventId ||
      `EVT_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const standardizedEvent = {
      eventId,
      eventType,
      source: eventData.source || "System",
      timestamp: eventData.timestamp || new Date(),
      message: eventData.message || `Event ${eventType} emitted by ${eventData.source || "System"}`,
      entity: {
        studentId: eventData.entity?.studentId || "",
        jobId: eventData.entity?.jobId || "",
        interviewId: eventData.entity?.interviewId || "",
        offerId: eventData.entity?.offerId || "",
        conflictId: eventData.entity?.conflictId || "",
        proposalId: eventData.entity?.proposalId || "",
        panelId: eventData.entity?.panelId || "",
        roomId: eventData.entity?.roomId || "",
        ...(eventData.entity || {}),
      },
      payload: eventData.payload || {},
      status: eventData.status || "info",
    };

    // 1. Asynchronously log to AgentLog collection in MongoDB if connected
    if (require("mongoose").connection.readyState === 1) {
      try {
        await AgentLog.create({
          eventId: standardizedEvent.eventId,
          agent: standardizedEvent.source,
          eventType: standardizedEvent.eventType,
          message: standardizedEvent.message,
          entity: standardizedEvent.entity,
          payload: standardizedEvent.payload,
          status: standardizedEvent.status,
          timestamp: standardizedEvent.timestamp,
        });
      } catch (logError) {
        // Safe error logging: DB failure should not crash in-memory event dispatch
        console.error(`⚠️ Failed to persist AgentLog for ${eventType}:`, logError.message);
      }
    }

    // 2. Broadcast to connected frontend clients in real time
    try {
      socketService.broadcastAgentActivity(standardizedEvent);
    } catch (socketError) {
      console.error(`⚠️ Socket broadcast failed for ${eventType}:`, socketError.message);
    }

    // 3. Emit on EventEmitter for subscribed backend agents/services
    this.emit(eventType, standardizedEvent);
    this.emit("*", standardizedEvent);

    return standardizedEvent;
  }

  /**
   * Subscribe to a specific event type.
   */
  subscribe(eventType, handler) {
    this.on(eventType, handler);
  }

  /**
   * Subscribe to all events.
   */
  subscribeAll(handler) {
    this.on("*", handler);
  }

  /**
   * Unsubscribe from an event.
   */
  unsubscribe(eventType, handler) {
    this.off(eventType, handler);
  }
}

const eventBus = new EventBus();
module.exports = eventBus;
