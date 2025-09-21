const mysql = require('mysql2');
require('dotenv').config();

// Database connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'support_system'
});

async function addSampleData() {
  try {
    console.log('🚀 Adding sample data for testing real API endpoints...');
    
    // Add more test users
    const additionalUsers = `
      INSERT IGNORE INTO users (username, email, password, name, role) VALUES
      ('agent_b', 'agentb@helpdesk.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Agent B', 'agent'),
      ('agent_c', 'agentc@helpdesk.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Agent C', 'agent'),
      ('john_doe', 'john@customer.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', 'customer'),
      ('jane_smith', 'jane@customer.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane Smith', 'customer'),
      ('mike_wilson', 'mike@customer.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mike Wilson', 'customer');
    `;
    
    await new Promise((resolve, reject) => {
      connection.query(additionalUsers, (err, results) => {
        if (err) {
          console.error('❌ Error adding users:', err);
          reject(err);
        } else {
          console.log('✅ Additional users added');
          resolve(results);
        }
      });
    });
    
    // Add sample tickets with various statuses and priorities
    const sampleTickets = `
      INSERT INTO tickets (subject, description, priority, customer_id, agent_id, status, sla_deadline, resolved_at, resolution_note, created_at) VALUES
      
      -- Recent tickets (last 7 days)
      ('Login Issues', 'Cannot access my account after password reset', 'high', 
       (SELECT id FROM users WHERE email = 'john@customer.com'), 
       (SELECT id FROM users WHERE email = 'agenta@helpdesk.com'), 
       'resolved', 
       DATE_ADD(DATE_SUB(NOW(), INTERVAL 2 DAY), INTERVAL 24 HOUR),
       DATE_SUB(NOW(), INTERVAL 1 DAY),
       'Password reset link was expired. New link sent and issue resolved.',
       DATE_SUB(NOW(), INTERVAL 2 DAY)),
       
      ('Billing Question', 'Charged twice for the same order', 'medium', 
       (SELECT id FROM users WHERE email = 'jane@customer.com'), 
       (SELECT id FROM users WHERE email = 'agentb@helpdesk.com'), 
       'resolved', 
       DATE_ADD(DATE_SUB(NOW(), INTERVAL 3 DAY), INTERVAL 48 HOUR),
       DATE_SUB(NOW(), INTERVAL 6 HOUR),
       'Duplicate charge refunded. Processing time 3-5 business days.',
       DATE_SUB(NOW(), INTERVAL 3 DAY)),
       
      ('Product Defect', 'Laptop screen flickering after 2 weeks of use', 'urgent', 
       (SELECT id FROM users WHERE email = 'mike@customer.com'), 
       (SELECT id FROM users WHERE email = 'agentc@helpdesk.com'), 
       'in_progress', 
       DATE_ADD(DATE_SUB(NOW(), INTERVAL 1 DAY), INTERVAL 4 HOUR),
       NULL,
       NULL,
       DATE_SUB(NOW(), INTERVAL 1 DAY)),
       
      ('Feature Request', 'Add dark mode to mobile app', 'low', 
       (SELECT id FROM users WHERE email = 'john@customer.com'), 
       NULL, 
       'open', 
       DATE_ADD(NOW(), INTERVAL 72 HOUR),
       NULL,
       NULL,
       NOW()),
       
      -- Older tickets (last month)
      ('Shipping Delay', 'Order shipped but not received after 10 days', 'high', 
       (SELECT id FROM users WHERE email = 'jane@customer.com'), 
       (SELECT id FROM users WHERE email = 'agenta@helpdesk.com'), 
       'resolved', 
       DATE_ADD(DATE_SUB(NOW(), INTERVAL 15 DAY), INTERVAL 24 HOUR),
       DATE_SUB(NOW(), INTERVAL 14 DAY),
       'Package was lost in transit. Replacement shipped with expedited delivery.',
       DATE_SUB(NOW(), INTERVAL 15 DAY)),
       
      ('Account Suspension', 'Account suspended without notice', 'urgent', 
       (SELECT id FROM users WHERE email = 'mike@customer.com'), 
       (SELECT id FROM users WHERE email = 'agentb@helpdesk.com'), 
       'resolved', 
       DATE_ADD(DATE_SUB(NOW(), INTERVAL 20 DAY), INTERVAL 4 HOUR),
       DATE_SUB(NOW(), INTERVAL 19 DAY),
       'Account suspension was due to suspicious activity. Verified identity and restored access.',
       DATE_SUB(NOW(), INTERVAL 20 DAY)),
       
      ('Technical Support', 'API integration not working', 'medium', 
       (SELECT id FROM users WHERE email = 'john@customer.com'), 
       (SELECT id FROM users WHERE email = 'agentc@helpdesk.com'), 
       'resolved', 
       DATE_ADD(DATE_SUB(NOW(), INTERVAL 25 DAY), INTERVAL 48 HOUR),
       DATE_SUB(NOW(), INTERVAL 23 DAY),
       'API key was incorrectly configured. Provided correct implementation guide.',
       DATE_SUB(NOW(), INTERVAL 25 DAY)),
       
      -- Current open tickets
      ('Refund Request', 'Want to return unused software license', 'medium', 
       (SELECT id FROM users WHERE email = 'jane@customer.com'), 
       (SELECT id FROM users WHERE email = 'agenta@helpdesk.com'), 
       'in_progress', 
       DATE_ADD(DATE_SUB(NOW(), INTERVAL 2 HOUR), INTERVAL 48 HOUR),
       NULL,
       NULL,
       DATE_SUB(NOW(), INTERVAL 2 HOUR)),
       
      ('Data Export', 'Need to export all my data before account closure', 'low', 
       (SELECT id FROM users WHERE email = 'mike@customer.com'), 
       NULL, 
       'open', 
       DATE_ADD(DATE_SUB(NOW(), INTERVAL 1 HOUR), INTERVAL 72 HOUR),
       NULL,
       NULL,
       DATE_SUB(NOW(), INTERVAL 1 HOUR));
    `;
    
    await new Promise((resolve, reject) => {
      connection.query(sampleTickets, (err, results) => {
        if (err) {
          console.error('❌ Error adding sample tickets:', err);
          reject(err);
        } else {
          console.log('✅ Sample tickets added');
          resolve(results);
        }
      });
    });
    
    // Add sample messages for some tickets
    const sampleMessages = `
      INSERT INTO messages (ticket_id, user_id, message, message_type, created_at) VALUES
      
      -- Messages for Login Issues ticket
      (1, (SELECT id FROM users WHERE email = 'john@customer.com'), 'I tried to reset my password but the link doesn''t work', 'customer', DATE_SUB(NOW(), INTERVAL 2 DAY)),
      (1, (SELECT id FROM users WHERE email = 'agenta@helpdesk.com'), 'Let me check your account. Can you tell me when you requested the reset?', 'agent', DATE_SUB(NOW(), INTERVAL 2 DAY)),
      (1, (SELECT id FROM users WHERE email = 'john@customer.com'), 'I requested it yesterday morning around 9 AM', 'customer', DATE_SUB(NOW(), INTERVAL 2 DAY)),
      (1, (SELECT id FROM users WHERE email = 'agenta@helpdesk.com'), 'I see the issue. The reset link expired. I''ve sent you a new one that will be valid for 24 hours.', 'agent', DATE_SUB(NOW(), INTERVAL 1 DAY)),
      
      -- Messages for current Product Defect ticket
      (3, (SELECT id FROM users WHERE email = 'mike@customer.com'), 'My laptop screen started flickering randomly. It''s very distracting during work.', 'customer', DATE_SUB(NOW(), INTERVAL 1 DAY)),
      (3, (SELECT id FROM users WHERE email = 'agentc@helpdesk.com'), 'I''m sorry to hear about this issue. This sounds like a hardware defect. Can you tell me the model and serial number?', 'agent', DATE_SUB(NOW(), INTERVAL 1 DAY)),
      (3, (SELECT id FROM users WHERE email = 'mike@customer.com'), 'It''s a ThinkPad X1 Carbon, serial number: ABC123XYZ789', 'customer', DATE_SUB(NOW(), INTERVAL 1 DAY)),
      (3, (SELECT id FROM users WHERE email = 'agentc@helpdesk.com'), 'Thank you. I''m arranging a replacement unit. You should receive it within 2 business days.', 'agent', DATE_SUB(NOW(), INTERVAL 6 HOUR));
    `;
    
    await new Promise((resolve, reject) => {
      connection.query(sampleMessages, (err, results) => {
        if (err) {
          console.error('❌ Error adding sample messages:', err);
          reject(err);
        } else {
          console.log('✅ Sample messages added');
          resolve(results);
        }
      });
    });
    
    // Add some notifications
    const sampleNotifications = `
      INSERT INTO notifications (user_id, ticket_id, type, title, message, is_read, sent_at) VALUES
      
      -- Customer notifications
      ((SELECT id FROM users WHERE email = 'john@customer.com'), 1, 'ticket_resolved', 'Ticket Resolved', 'Your login issue has been resolved.', true, DATE_SUB(NOW(), INTERVAL 1 DAY)),
      ((SELECT id FROM users WHERE email = 'mike@customer.com'), 3, 'ticket_assigned', 'Ticket Assigned', 'Your product defect report has been assigned to Agent C.', false, DATE_SUB(NOW(), INTERVAL 1 DAY)),
      
      -- Agent notifications
      ((SELECT id FROM users WHERE email = 'agenta@helpdesk.com'), 8, 'ticket_assigned', 'New Ticket Assigned', 'Refund request ticket has been assigned to you.', false, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
      
      -- Admin notifications
      ((SELECT id FROM users WHERE email = 'singh@helpdesk.com'), 3, 'sla_breach', 'SLA Warning', 'Ticket #3 is approaching SLA deadline.', false, DATE_SUB(NOW(), INTERVAL 1 HOUR));
    `;
    
    await new Promise((resolve, reject) => {
      connection.query(sampleNotifications, (err, results) => {
        if (err) {
          console.error('❌ Error adding sample notifications:', err);
          reject(err);
        } else {
          console.log('✅ Sample notifications added');
          resolve(results);
        }
      });
    });
    
    console.log('🎉 Sample data added successfully!');
    console.log('');
    console.log('📊 Data Summary:');
    console.log('   👥 Users: 8 total (3 customers, 3 agents, 2 admins)');
    console.log('   🎫 Tickets: 10 total (2 open, 2 in progress, 6 resolved)');
    console.log('   💬 Messages: Chat history for active tickets');
    console.log('   🔔 Notifications: Sample notifications for all user types');
    console.log('');
    console.log('🎯 Test Scenarios Available:');
    console.log('   📈 Agent Performance: Real resolution times and SLA compliance');
    console.log('   📊 Admin Analytics: Monthly trends and system metrics');
    console.log('   🎪 Customer Experience: Ticket history and status tracking');
    console.log('');
    console.log('🚀 Ready to test with real data!');
    
  } catch (error) {
    console.error('❌ Sample data setup failed:', error);
  } finally {
    connection.end();
  }
}

// Run the setup
addSampleData();