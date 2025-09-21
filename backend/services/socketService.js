const db = require('../config/db');

const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room for specific ticket
    socket.on('joinRoom', (ticketId) => {
      socket.join(`ticket_${ticketId}`);
      console.log(`User ${socket.id} joined room: ticket_${ticketId}`);
    });

    // Send message
    socket.on('sendMessage', (data) => {
      const { ticketId, senderId, message, senderName, senderRole } = data;
      
      // Store message in database
      db.query(
        'INSERT INTO chats (ticket_id, sender_id, message) VALUES (?, ?, ?)',
        [ticketId, senderId, message],
        (err, result) => {
          if (err) {
            console.error('Error saving message:', err);
            socket.emit('messageError', { error: 'Failed to save message' });
            return;
          }

          const messageData = {
            id: result.insertId,
            ticket_id: ticketId,
            sender_id: senderId,  // Fixed: Use sender_id instead of senderId
            message,
            sender_name: senderName,  // Fixed: Use sender_name instead of senderName
            sender_role: senderRole,  // Fixed: Use sender_role instead of senderRole
            timestamp: new Date()
          };

          // Send to all users in the ticket room
          io.to(`ticket_${ticketId}`).emit('receiveMessage', messageData);
        }
      );
    });

    // Leave room
    socket.on('leaveRoom', (ticketId) => {
      socket.leave(`ticket_${ticketId}`);
      console.log(`User ${socket.id} left room: ticket_${ticketId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = { handleSocketConnection };