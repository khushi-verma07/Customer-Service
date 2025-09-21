const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// GET /reports/monthly - Ticket counts, SLA breaches
router.get('/monthly', authenticateToken, authorizeRole(['admin', 'agent']), (req, res) => {
  const queries = [
    // Monthly ticket counts
    `SELECT 
       DATE_FORMAT(created_at, '%Y-%m') as month,
       COUNT(*) as total_tickets,
       SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_tickets,
       SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_tickets
     FROM tickets 
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
     GROUP BY DATE_FORMAT(created_at, '%Y-%m')
     ORDER BY month DESC`,
    
    // SLA breaches
    `SELECT COUNT(*) as sla_breaches 
     FROM sla_logs 
     WHERE escalated = true AND breach_time >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`
  ];
  
  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    })
  ))
  .then(([monthlyData, slaData]) => {
    res.json({
      monthly_tickets: monthlyData,
      sla_breaches: slaData[0].sla_breaches
    });
  })
  .catch(err => res.status(500).json({ error: err.message }));
});

// GET /reports/performance - Avg resolution time
router.get('/performance', authenticateToken, authorizeRole(['admin', 'agent']), (req, res) => {
  const query = `
    SELECT 
      AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_resolution_hours,
      COUNT(*) as total_resolved,
      AVG(CASE WHEN priority = 'urgent' THEN TIMESTAMPDIFF(HOUR, created_at, resolved_at) END) as avg_urgent_resolution,
      AVG(CASE WHEN priority = 'high' THEN TIMESTAMPDIFF(HOUR, created_at, resolved_at) END) as avg_high_resolution,
      AVG(CASE WHEN priority = 'medium' THEN TIMESTAMPDIFF(HOUR, created_at, resolved_at) END) as avg_medium_resolution,
      AVG(CASE WHEN priority = 'low' THEN TIMESTAMPDIFF(HOUR, created_at, resolved_at) END) as avg_low_resolution
    FROM tickets 
    WHERE resolved_at IS NOT NULL 
    AND created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
  `;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// GET /reports/agent-performance - Real agent performance data
router.get('/agent-performance', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const query = `
    SELECT 
      u.id,
      u.name,
      u.email,
      COUNT(t.id) as total_tickets,
      SUM(CASE WHEN t.status IN ('resolved', 'closed') THEN 1 ELSE 0 END) as tickets_resolved,
      AVG(CASE WHEN t.resolved_at IS NOT NULL THEN TIMESTAMPDIFF(HOUR, t.created_at, t.resolved_at) END) as avg_resolution_hours,
      SUM(CASE WHEN t.resolved_at <= t.sla_deadline THEN 1 ELSE 0 END) as sla_met,
      COUNT(CASE WHEN t.resolved_at IS NOT NULL THEN 1 END) as resolved_count,
      u.is_active as status
    FROM users u
    LEFT JOIN tickets t ON u.id = t.agent_id
    WHERE u.role = 'agent'
    GROUP BY u.id, u.name, u.email, u.is_active
    ORDER BY tickets_resolved DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const agentPerformance = results.map(agent => ({
      name: agent.name,
      email: agent.email,
      ticketsResolved: agent.tickets_resolved || 0,
      totalTickets: agent.total_tickets || 0,
      avgResolutionTime: (agent.avg_resolution_hours && typeof agent.avg_resolution_hours === 'number') ? 
        (agent.avg_resolution_hours < 1 ? 
          `${Math.round(agent.avg_resolution_hours * 60)}m` : 
          `${agent.avg_resolution_hours.toFixed(1)}h`) : 'N/A',
      slaCompliance: agent.resolved_count > 0 ? 
        Math.round((agent.sla_met / agent.resolved_count) * 100) : 100,
      status: agent.status ? 'active' : 'inactive'
    }));
    
    res.json(agentPerformance);
  });
});

module.exports = router;