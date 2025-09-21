const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// POST /tickets - Raise ticket (Enhanced with SLA and notifications)
router.post('/', authenticateToken, (req, res) => {
  const { subject, description, priority = 'medium' } = req.body;
  const customer_id = req.user.id;
  
  // Insert ticket (SLA deadline will be set by trigger)
  db.query(
    'INSERT INTO tickets (customer_id, subject, description, priority) VALUES (?, ?, ?, ?)',
    [customer_id, subject, description, priority],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const ticketId = result.insertId;
      
      // Get SLA deadline for response
      db.query(
        'SELECT sla_deadline FROM tickets WHERE id = ?',
        [ticketId],
        (err, slaResult) => {
          if (err) console.error('Error getting SLA:', err);
          
          const slaHours = slaResult && slaResult[0] ? 
            Math.round((new Date(slaResult[0].sla_deadline) - new Date()) / (1000 * 60 * 60)) : 24;
          
          // Create notification for customer
          db.query(
            'INSERT INTO notifications (user_id, ticket_id, type, title, message) VALUES (?, ?, ?, ?, ?)',
            [customer_id, ticketId, 'ticket_created', 'Ticket Created Successfully', 
             `Your ticket #${ticketId} has been created. SLA for resolution: ${slaHours} hours.`],
            (err) => { if (err) console.error('Notification error:', err); }
          );
          
          res.status(201).json({ 
            message: 'Ticket created successfully', 
            ticketId: ticketId,
            slaMessage: `Your ticket has been created. SLA for resolution: ${slaHours} hours.`
          });
        }
      );
    }
  );
});

// GET /tickets - List tickets by role
router.get('/', authenticateToken, (req, res) => {
  let query;
  let params = [];
  
  if (req.user.role === 'customer') {
    query = 'SELECT * FROM tickets WHERE customer_id = ? ORDER BY created_at DESC';
    params = [req.user.id];
  } else if (req.user.role === 'agent') {
    query = 'SELECT * FROM tickets WHERE agent_id = ? OR agent_id IS NULL ORDER BY created_at DESC';
    params = [req.user.id];
  } else {
    query = 'SELECT * FROM tickets ORDER BY created_at DESC';
  }
  
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// PUT /tickets/:id - Update status, assign agent (Enhanced with notifications)
router.put('/:id', authenticateToken, authorizeRole(['agent', 'admin']), (req, res) => {
  const { status, agent_id, resolution_note, internal_notes } = req.body;
  const ticketId = req.params.id;
  
  // First get current ticket info
  db.query('SELECT * FROM tickets WHERE id = ?', [ticketId], (err, ticketResult) => {
    if (err) return res.status(500).json({ error: err.message });
    if (ticketResult.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    
    const currentTicket = ticketResult[0];
    let updateFields = [];
    let params = [];
    
    if (status) {
      updateFields.push('status = ?');
      params.push(status);
    }
    
    if (agent_id) {
      updateFields.push('agent_id = ?');
      params.push(agent_id);
    }
    
    if (resolution_note) {
      updateFields.push('resolution_note = ?');
      params.push(resolution_note);
    }
    
    if (internal_notes) {
      updateFields.push('internal_notes = ?');
      params.push(internal_notes);
    }
    
    params.push(ticketId);
    
    db.query(
      `UPDATE tickets SET ${updateFields.join(', ')} WHERE id = ?`,
      params,
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Create notifications based on changes
        if (agent_id && agent_id !== currentTicket.agent_id) {
          // Ticket assigned notification
          db.query(
            'INSERT INTO notifications (user_id, ticket_id, type, title, message) VALUES (?, ?, ?, ?, ?)',
            [agent_id, ticketId, 'ticket_assigned', 'New Ticket Assigned', 
             `Ticket #${ticketId} has been assigned to you.`],
            (err) => { if (err) console.error('Notification error:', err); }
          );
        }
        
        if (status && status !== currentTicket.status) {
          // Status update notification to customer
          const statusMessages = {
            'in_progress': 'Your ticket is now being worked on.',
            'resolved': 'Your ticket has been resolved.',
            'closed': 'Your ticket has been closed.'
          };
          
          if (statusMessages[status]) {
            db.query(
              'INSERT INTO notifications (user_id, ticket_id, type, title, message) VALUES (?, ?, ?, ?, ?)',
              [currentTicket.customer_id, ticketId, 'ticket_updated', 'Ticket Status Updated', 
               `Ticket #${ticketId}: ${statusMessages[status]}`],
              (err) => { if (err) console.error('Notification error:', err); }
            );
          }
        }
        
        res.json({ message: 'Ticket updated successfully' });
      }
    );
  });
});

// GET /tickets/dashboard-stats - Customer dashboard statistics
router.get('/dashboard-stats', authenticateToken, (req, res) => {
  const customer_id = req.user.id;
  
  const queries = [
    // Total tickets count
    `SELECT COUNT(*) as total_tickets FROM tickets WHERE customer_id = ?`,
    
    // Open tickets count
    `SELECT COUNT(*) as open_tickets FROM tickets WHERE customer_id = ? AND status IN ('open', 'in_progress')`,
    
    // Resolved tickets count
    `SELECT COUNT(*) as resolved_tickets FROM tickets WHERE customer_id = ? AND status IN ('resolved', 'closed')`,
    
    // Average response time for customer's tickets
    `SELECT 
       AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_resolution_hours
     FROM tickets 
     WHERE customer_id = ? AND resolved_at IS NOT NULL`
  ];
  
  Promise.all(queries.map((query, index) => 
    new Promise((resolve, reject) => {
      db.query(query, [customer_id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    })
  ))
  .then(([totalData, openData, resolvedData, avgTimeData]) => {
    const avgHours = avgTimeData.avg_resolution_hours || 0;
    const avgResponseTime = avgHours > 0 ? 
      (avgHours < 1 ? `${Math.round(avgHours * 60)}m` : `${avgHours.toFixed(1)}h`) : 
      'N/A';
    
    res.json({
      total_tickets: totalData.total_tickets,
      open_tickets: openData.open_tickets,
      resolved_tickets: resolvedData.resolved_tickets,
      avg_response_time: avgResponseTime
    });
  })
  .catch(err => res.status(500).json({ error: err.message }));
});

// GET /tickets/agent-stats - Agent dashboard statistics (Enhanced)
router.get('/agent-stats', authenticateToken, (req, res) => {
  const agent_id = req.user.id;
  
  const queries = [
    // Total tickets assigned to agent
    `SELECT COUNT(*) as assigned_tickets FROM tickets WHERE agent_id = ?`,
    
    // Tickets resolved by agent
    `SELECT COUNT(*) as resolved_tickets FROM tickets WHERE agent_id = ? AND status IN ('resolved', 'closed')`,
    
    // Tickets resolved today
    `SELECT COUNT(*) as resolved_today FROM tickets WHERE agent_id = ? AND status = 'resolved' AND DATE(resolved_at) = CURDATE()`,
    
    // Average resolution time for agent
    `SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_resolution_hours FROM tickets WHERE agent_id = ? AND resolved_at IS NOT NULL`,
    
    // SLA performance
    `SELECT 
       COUNT(*) as total_resolved,
       SUM(CASE WHEN resolved_at <= sla_deadline THEN 1 ELSE 0 END) as within_sla
     FROM tickets WHERE agent_id = ? AND resolved_at IS NOT NULL`
  ];
  
  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.query(query, [agent_id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    })
  ))
  .then(([assignedData, resolvedData, todayData, avgTimeData, slaData]) => {
    const avgHours = avgTimeData.avg_resolution_hours || 0;
    const avgResponseTime = avgHours > 0 ? 
      (avgHours < 1 ? `${Math.round(avgHours * 60)}m` : `${avgHours.toFixed(1)}h`) : 
      'N/A';
    
    const slaCompliance = slaData.total_resolved > 0 ? 
      Math.round((slaData.within_sla / slaData.total_resolved) * 100) : 100;
    
    res.json({
      assigned_tickets: assignedData.assigned_tickets,
      resolved_tickets: resolvedData.resolved_tickets,
      resolved_today: todayData.resolved_today,
      avg_response_time: avgResponseTime,
      sla_compliance: slaCompliance
    });
  })
  .catch(err => res.status(500).json({ error: err.message }));
});

// GET /tickets/admin-stats - Admin dashboard statistics
router.get('/admin-stats', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const queries = [
    // Total tickets
    `SELECT COUNT(*) as total_tickets FROM tickets`,
    
    // Open tickets
    `SELECT COUNT(*) as open_tickets FROM tickets WHERE status IN ('open', 'in_progress')`,
    
    // SLA breaches
    `SELECT COUNT(*) as sla_breaches FROM tickets WHERE sla_breached = TRUE OR (status NOT IN ('resolved', 'closed') AND NOW() > sla_deadline)`,
    
    // Resolved tickets
    `SELECT COUNT(*) as resolved_tickets FROM tickets WHERE status IN ('resolved', 'closed')`,
    
    // Today's tickets
    `SELECT COUNT(*) as today_tickets FROM tickets WHERE DATE(created_at) = CURDATE()`,
    
    // Average resolution time
    `SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_resolution_hours FROM tickets WHERE resolved_at IS NOT NULL`,
    
    // SLA compliance rate
    `SELECT 
       COUNT(*) as total_resolved,
       SUM(CASE WHEN resolved_at <= sla_deadline THEN 1 ELSE 0 END) as within_sla
     FROM tickets WHERE resolved_at IS NOT NULL`
  ];
  
  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.query(query, [], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    })
  ))
  .then(([totalData, openData, slaBreachData, resolvedData, todayData, avgTimeData, slaComplianceData]) => {
    const avgHours = avgTimeData.avg_resolution_hours || 0;
    const avgResolutionTime = avgHours > 0 ? 
      (avgHours < 1 ? `${Math.round(avgHours * 60)}m` : `${avgHours.toFixed(1)}h`) : 
      'N/A';
    
    const slaCompliance = slaComplianceData.total_resolved > 0 ? 
      Math.round((slaComplianceData.within_sla / slaComplianceData.total_resolved) * 100) : 100;
    
    res.json({
      totalTickets: totalData.total_tickets,
      openTickets: openData.open_tickets,
      slaBreaches: slaBreachData.sla_breaches,
      resolvedTickets: resolvedData.resolved_tickets,
      todayTickets: todayData.today_tickets,
      avgResolutionTime: avgResolutionTime,
      slaCompliance: slaCompliance
    });
  })
  .catch(err => res.status(500).json({ error: err.message }));
});

// GET /tickets/monthly-report - Monthly statistics for admin
router.get('/monthly-report', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const query = `
    SELECT 
      DATE_FORMAT(created_at, '%Y-%m') as month,
      COUNT(*) as total_tickets,
      SUM(CASE WHEN status IN ('resolved', 'closed') THEN 1 ELSE 0 END) as resolved_tickets,
      AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_resolution_hours
    FROM tickets 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month DESC
  `;
  
  db.query(query, [], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const formattedResults = results.map(row => ({
      month: new Date(row.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
      total_tickets: row.total_tickets,
      resolved_tickets: row.resolved_tickets,
      avg_resolution_hours: row.avg_resolution_hours ? parseFloat(row.avg_resolution_hours).toFixed(1) : '0'
    }));
    
    res.json(formattedResults);
  });
});

// GET /tickets/user-stats - User statistics for admin
router.get('/user-stats', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const queries = [
    `SELECT COUNT(*) as totalUsers FROM users`,
    `SELECT COUNT(*) as customers FROM users WHERE role = 'customer'`,
    `SELECT COUNT(*) as agents FROM users WHERE role = 'agent'`,
    `SELECT COUNT(*) as activeAgents FROM users WHERE role = 'agent' AND is_active = TRUE`
  ];
  
  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.query(query, [], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    })
  ))
  .then(([totalData, customerData, agentData, activeAgentData]) => {
    res.json({
      totalUsers: totalData.totalUsers,
      customers: customerData.customers,
      agents: agentData.agents,
      activeAgents: activeAgentData.activeAgents
    });
  })
  .catch(err => res.status(500).json({ error: err.message }));
});

// GET /tickets/:id/sla-status - Get SLA status for a ticket
router.get('/:id/sla-status', authenticateToken, (req, res) => {
  const ticketId = req.params.id;
  
  db.query(
    `SELECT 
       id, status, priority, created_at, sla_deadline, resolved_at,
       CASE 
         WHEN status IN ('resolved', 'closed') THEN 'completed'
         WHEN NOW() > sla_deadline THEN 'breached'
         WHEN TIMESTAMPDIFF(HOUR, NOW(), sla_deadline) <= 2 THEN 'warning'
         ELSE 'on_track'
       END as sla_status,
       TIMESTAMPDIFF(HOUR, NOW(), sla_deadline) as hours_remaining
     FROM tickets WHERE id = ?`,
    [ticketId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Ticket not found' });
      
      res.json(results[0]);
    }
  );
});

module.exports = router;