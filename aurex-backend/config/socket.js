/**
 * Socket.io Configuration - AUREX Civic Issue Reporting System
 * 
 * Real-time communication setup using Socket.io.
 */

const { Server } = require('socket.io');

let io = null;

// Store connected users globally
const connectedUsers = new Map();

/**
 * Initialize Socket.io server
 * @param {Object} httpServer - HTTP server instance
 * @returns {Object} Socket.io server instance
 */
const initializeSocket = (httpServer) => {

  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {

    console.log(`User connected: ${socket.id}`);

    /**
     * USER AUTHENTICATION
     */
    socket.on('authenticate', (userId) => {
      try {
        if (!userId) return;

        connectedUsers.set(userId, socket.id);
        socket.userId = userId;

        console.log(`User ${userId} authenticated`);
      } catch (error) {
        console.error("Authentication socket error:", error);
      }
    });


    /**
     * JOIN CONVERSATION ROOM
     */
    socket.on('join_conversation', (conversationId) => {
      try {
        if (!conversationId) return;

        socket.join(`conversation_${conversationId}`);

        console.log(`Socket ${socket.id} joined conversation ${conversationId}`);

      } catch (error) {
        console.error("Join conversation error:", error);
      }
    });


    /**
     * LEAVE CONVERSATION ROOM
     */
    socket.on('leave_conversation', (conversationId) => {
      try {

        socket.leave(`conversation_${conversationId}`);

        console.log(`Socket ${socket.id} left conversation ${conversationId}`);

      } catch (error) {
        console.error("Leave conversation error:", error);
      }
    });


    /**
     * SEND MESSAGE (REAL TIME)
     */
    socket.on('send_message', (data) => {

      try {

        if (!data || !data.recipient) {
          console.log("Invalid message data:", data);
          return;
        }

        const { recipient, conversationId } = data;

        // Send message to conversation room
        if (conversationId) {
          io.to(`conversation_${conversationId}`).emit('receive_message', data);
        }

        // Send message directly to recipient if online
        const recipientSocketId = connectedUsers.get(recipient);

        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receive_message', data);
        }

      } catch (error) {
        console.error("Socket message error:", error);
      }

    });


    /**
     * TYPING INDICATOR
     */
    socket.on('typing', (data) => {

      try {

        const { conversationId, userId, isTyping } = data;

        socket.to(`conversation_${conversationId}`).emit('user_typing', {
          userId,
          isTyping
        });

      } catch (error) {
        console.error("Typing indicator error:", error);
      }

    });


    /**
     * REPORT STATUS UPDATE
     */
    socket.on('report_status_update', (data) => {

      try {

        const { reportId, status, userId } = data;

        const ownerSocketId = connectedUsers.get(userId);

        if (ownerSocketId) {

          io.to(ownerSocketId).emit('report_updated', {
            reportId,
            status,
            message: `Your report status has been updated to ${status}`
          });

        }

      } catch (error) {
        console.error("Report update socket error:", error);
      }

    });


    /**
     * DISCONNECT
     */
    socket.on('disconnect', () => {

      try {

        console.log(`User disconnected: ${socket.id}`);

        if (socket.userId) {
          connectedUsers.delete(socket.userId);
        }

      } catch (error) {
        console.error("Disconnect error:", error);
      }

    });

  });

  console.log('Socket.io initialized');

  return io;

};


/**
 * Get Socket.io instance
 */
const getIO = () => {

  if (!io) {
    throw new Error('Socket.io not initialized');
  }

  return io;

};


/**
 * Emit event to specific user
 */
const emitToUser = (userId, event, data) => {

  if (!io) return;

  const socketId = connectedUsers.get(userId);

  if (socketId) {
    io.to(socketId).emit(event, data);
  }

};


/**
 * Broadcast event to all clients
 */
const broadcast = (event, data) => {

  if (!io) return;

  io.emit(event, data);

};


module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  broadcast
};