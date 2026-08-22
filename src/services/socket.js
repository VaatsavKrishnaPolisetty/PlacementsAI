/**
 * Socket.io Real-time Service for AI Campus Placement Operations Frontend
 * Listens for live agent activities, notifications, conflict alerts, and schedule cascades.
 */

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5001';

class SocketClient {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnected = false;
  }

  connect(userId = 'TPO_ADMIN', role = 'tpo') {
    if (this.socket) return this.socket;

    try {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('⚡ [Socket] Connected to Placement Real-Time Engine:', this.socket.id);

        // Join personal and role-based rooms
        this.socket.emit('register_user', { userId, role });
        this.socket.emit('join_role_room', { role });
      });

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false;
        console.log('🔌 [Socket] Disconnected:', reason);
      });

      this.socket.on('connect_error', (err) => {
        console.warn('⚠️ [Socket] Real-time connection error (falling back to polling/local):', err.message);
      });

      // Forward standard events to registered callbacks
      const eventNames = [
        'notification',
        'agent_activity',
        'conflict_detected',
        'conflict_resolved',
        'schedule_updated',
        'offer_cascade',
      ];

      eventNames.forEach((ev) => {
        this.socket.on(ev, (data) => {
          this.emitLocal(ev, data);
        });
      });
    } catch (err) {
      console.warn('⚠️ [Socket] Failed to initialize socket connection:', err.message);
    }

    return this.socket;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return cleanup unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emitLocal(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in socket listener for ${event}:`, e);
        }
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export const socketService = new SocketClient();
export default socketService;
