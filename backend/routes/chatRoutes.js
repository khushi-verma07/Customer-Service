const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// POST /tickets/:id/chat - Send message
router.post('/:id/chat', authenticateToken, (req, res) => {
  const { message } = req.body;
  const ticketId = req.params.id;
  const senderId = req.user.id;
  
  console.log('💬 Chat API - Sending message:', { ticketId, senderId, message });
  
  // Check if user has access to this ticket
  const accessQuery = req.user.role === 'admin' 
    ? 'SELECT * FROM tickets WHERE id = ?'
    : 'SELECT * FROM tickets WHERE id = ? AND (customer_id = ? OR agent_id = ? OR agent_id IS NULL)';
  
  const accessParams = req.user.role === 'admin' 
    ? [ticketId] 
    : [ticketId, senderId, senderId];
  
  db.query(accessQuery, accessParams, (err, tickets) => {
    if (err) {
      console.error('Database error checking ticket access:', err);
      return res.status(500).json({ error: err.message });
    }
    
    if (tickets.length === 0) {
      console.log('Access denied to ticket:', ticketId, 'for user:', senderId);
      return res.status(403).json({ error: 'Access denied to this ticket' });
    }
    
    // Insert message
    db.query(
      'INSERT INTO chats (ticket_id, sender_id, message) VALUES (?, ?, ?)',
      [ticketId, senderId, message],
      (err, result) => {
        if (err) {
          console.error('Error saving message:', err);
          return res.status(500).json({ error: err.message });
        }
        
        console.log('✅ Message saved with ID:', result.insertId);
        res.status(201).json({ 
          message: 'Message sent', 
          chatId: result.insertId,
          timestamp: new Date()
        });
      }
    );
  });
});

// GET /tickets/:id/chat - Get messages
router.get('/:id/chat', authenticateToken, (req, res) => {
  const ticketId = req.params.id;
  const userId = req.user.id;
  
  console.log('📥 Chat API - Getting messages for ticket:', ticketId, 'user:', userId);
  
  // Check if user has access to this ticket
  const accessQuery = req.user.role === 'admin' 
    ? 'SELECT * FROM tickets WHERE id = ?'
    : 'SELECT * FROM tickets WHERE id = ? AND (customer_id = ? OR agent_id = ? OR agent_id IS NULL)';
  
  const accessParams = req.user.role === 'admin' 
    ? [ticketId] 
    : [ticketId, userId, userId];
  
  db.query(accessQuery, accessParams, (err, tickets) => {
    if (err) {
      console.error('Database error checking ticket access:', err);
      return res.status(500).json({ error: err.message });
    }
    
    if (tickets.length === 0) {
      console.log('Access denied to ticket messages:', ticketId, 'for user:', userId);
      return res.status(403).json({ error: 'Access denied to this ticket' });
    }
    
    // Get messages with user details
    db.query(
      `SELECT c.*, u.name as sender_name, u.role as sender_role 
       FROM chats c 
       JOIN users u ON c.sender_id = u.id 
       WHERE c.ticket_id = ? 
       ORDER BY c.timestamp ASC`,
      [ticketId],
      (err, results) => {
        if (err) {
          console.error('Error fetching messages:', err);
          return res.status(500).json({ error: err.message });
        }
        
        console.log(`✅ Retrieved ${results.length} messages for ticket ${ticketId}`);
        res.json(results);
      }
    );
  });
});

module.exports = router;