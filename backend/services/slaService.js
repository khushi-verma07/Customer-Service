const cron = require('node-cron');
const db = require('../config/db');

// Enhanced SLA monitoring service
function startSLAMonitoring() {
  console.log('🕐 Starting enhanced SLA monitoring service...');
  
  // Run every 15 minutes for better monitoring
  cron.schedule('*/15 * * * *', () => {
    console.log('⏰ Running SLA check...');
    checkSLABreaches();
    checkSLAWarnings();
  });
  
  // Run immediately on startup
  setTimeout(() => {
    checkSLABreaches();
    checkSLAWarnings();
  }, 5000);
}

function checkSLABreaches() {
  const query = `
    SELECT t.id, t.subject, t.customer_id, t.agent_id, t.priority, t.created_at, t.sla_deadline,
           u.email as customer_email, u.name as customer_name,
           a.name as agent_name, a.email as agent_email
    FROM tickets t
    JOIN users u ON t.customer_id = u.id
    LEFT JOIN users a ON t.agent_id = a.id
    WHERE t.status NOT IN ('resolved', 'closed')
    AND NOW() > t.sla_deadline
    AND t.sla_breached = FALSE
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('SLA breach check error:', err);
      return;
    }
    
    if (results.length > 0) {
      console.log(`🚨 Found ${results.length} new SLA breaches`);
      
      results.forEach(ticket => {
        console.log(`- Ticket #${ticket.id}: ${ticket.subject} (${ticket.priority})`);
        
        // Mark ticket as SLA breached
        db.query(
          'UPDATE tickets SET sla_breached = TRUE WHERE id = ?',
          [ticket.id],
          (err) => {
            if (err) console.error('Error updating SLA breach:', err);
          }
        );
        
        // Create notifications for SLA breach
        const notifications = [
          // Notify customer
          {
            user_id: ticket.customer_id,
            ticket_id: ticket.id,
            type: 'sla_breach',
            title: 'SLA Breach Alert',
            message: `We apologize, but ticket #${ticket.id} has exceeded our response time commitment. We are prioritizing your issue.`
          }
        ];
        
        // Notify agent if assigned
        if (ticket.agent_id) {
          notifications.push({
            user_id: ticket.agent_id,
            ticket_id: ticket.id,
            type: 'sla_breach',
            title: 'SLA Breach - Urgent Action Required',
            message: `Ticket #${ticket.id} has breached SLA. Immediate attention required.`
          });
        }
        
        // Notify all admins
        db.query(
          'SELECT id FROM users WHERE role = "admin"',
          [],
          (err, admins) => {
            if (!err && admins.length > 0) {
              admins.forEach(admin => {
                notifications.push({
                  user_id: admin.id,
                  ticket_id: ticket.id,
                  type: 'sla_breach',
                  title: 'SLA Breach Alert',
                  message: `Ticket #${ticket.id} (${ticket.priority} priority) has breached SLA. Customer: ${ticket.customer_name}`
                });
              });
              
              // Insert all notifications
              notifications.forEach(notification => {
                db.query(
                  'INSERT INTO notifications (user_id, ticket_id, type, title, message) VALUES (?, ?, ?, ?, ?)',
                  [notification.user_id, notification.ticket_id, notification.type, notification.title, notification.message],
                  (err) => {
                    if (err) console.error('Error creating SLA breach notification:', err);
                  }
                );
              });
            }
          }
        );
      });
    } else {
      console.log('✅ No new SLA breaches found');
    }
  });
}

function checkSLAWarnings() {
  // Check for tickets approaching SLA deadline (within 2 hours)
  const query = `
    SELECT t.id, t.subject, t.customer_id, t.agent_id, t.priority, t.sla_deadline,
           u.name as customer_name,
           a.name as agent_name
    FROM tickets t
    JOIN users u ON t.customer_id = u.id
    LEFT JOIN users a ON t.agent_id = a.id
    WHERE t.status NOT IN ('resolved', 'closed')
    AND t.sla_deadline BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 HOUR)
    AND t.sla_breached = FALSE
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('SLA warning check error:', err);
      return;
    }
    
    if (results.length > 0) {
      console.log(`⚠️  Found ${results.length} tickets approaching SLA deadline`);
      
      results.forEach(ticket => {
        const hoursRemaining = Math.ceil((new Date(ticket.sla_deadline) - new Date()) / (1000 * 60 * 60));
        console.log(`- Ticket #${ticket.id}: ${hoursRemaining}h remaining`);
        
        // Notify agent if assigned
        if (ticket.agent_id) {
          db.query(
            'INSERT INTO notifications (user_id, ticket_id, type, title, message) VALUES (?, ?, ?, ?, ?)',
            [ticket.agent_id, ticket.id, 'sla_breach', 'SLA Warning', 
             `Ticket #${ticket.id} will breach SLA in ${hoursRemaining} hour(s). Please prioritize.`],
            (err) => {
              if (err) console.error('Error creating SLA warning notification:', err);
            }
          );
        }
      });
    }
  });
}

// Function to get SLA deadline based on priority
function getSLADeadline(priority) {
  const slaHours = {
    'urgent': 4,
    'high': 24,
    'medium': 48,
    'low': 72
  };
  
  return slaHours[priority] || 48;
}

module.exports = {
  startSLAMonitoring,
  checkSLABreaches,
  checkSLAWarnings,
  getSLADeadline
};