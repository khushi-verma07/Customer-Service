const mysql = require('mysql2');
require('dotenv').config();

// Database connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
});

async function setupSafeDatabase() {
  try {
    console.log('🚀 Setting up enhanced customer support database safely...');
    
    // First, drop the database and recreate it
    const dropAndCreateDB = `
      DROP DATABASE IF EXISTS support_system;
      CREATE DATABASE support_system;
      USE support_system;
    `;
    
    await new Promise((resolve, reject) => {
      connection.query(dropAndCreateDB, (err, results) => {
        if (err) {
          console.error('❌ Error dropping/creating database:', err);
          reject(err);
        } else {
          console.log('✅ Database dropped and recreated');
          resolve(results);
        }
      });
    });
    
    // Create enhanced schema
    const enhancedSchema = `
      -- Enhanced Users table with additional fields
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role ENUM('admin', 'agent', 'customer') DEFAULT 'customer',
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      -- Enhanced Tickets table with SLA tracking
      CREATE TABLE tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        customer_id INT NOT NULL,
        agent_id INT NULL,
        
        -- SLA tracking fields
        sla_deadline TIMESTAMP NULL,
        sla_breached BOOLEAN DEFAULT FALSE,
        
        -- Resolution tracking
        resolved_at TIMESTAMP NULL,
        resolution_note TEXT NULL,
        
        -- Internal notes for agents/admins
        internal_notes TEXT NULL,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (customer_id) REFERENCES users(id),
        FOREIGN KEY (agent_id) REFERENCES users(id),
        
        -- Index for performance
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_customer (customer_id),
        INDEX idx_agent (agent_id),
        INDEX idx_sla_deadline (sla_deadline)
      );

      -- Enhanced Messages table for chat functionality
      CREATE TABLE messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        message_type ENUM('customer', 'agent', 'system') DEFAULT 'customer',
        is_internal BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id),
        
        INDEX idx_ticket (ticket_id),
        INDEX idx_created (created_at)
      );

      -- Notifications table for email/system notifications
      CREATE TABLE notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        ticket_id INT NULL,
        type ENUM('ticket_created', 'ticket_assigned', 'ticket_updated', 'ticket_resolved', 'sla_breach') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE SET NULL,
        
        INDEX idx_user (user_id),
        INDEX idx_read (is_read)
      );

      -- System settings for SLA configuration
      CREATE TABLE system_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        description TEXT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
    
    await new Promise((resolve, reject) => {
      connection.query(enhancedSchema, (err, results) => {
        if (err) {
          console.error('❌ Error creating schema:', err);
          reject(err);
        } else {
          console.log('✅ Enhanced database schema created');
          resolve(results);
        }
      });
    });
    
    // Insert default data
    const defaultData = `
      -- Insert default SLA settings (in hours)
      INSERT INTO system_settings (setting_key, setting_value, description) VALUES
      ('sla_low_priority', '72', 'SLA for low priority tickets in hours'),
      ('sla_medium_priority', '48', 'SLA for medium priority tickets in hours'),
      ('sla_high_priority', '24', 'SLA for high priority tickets in hours'),
      ('sla_urgent_priority', '4', 'SLA for urgent priority tickets in hours');

      -- Create default admin user (password: password123)
      INSERT INTO users (username, email, password, name, role) VALUES
      ('admin', 'admin@helpdesk.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin');

      -- Create test users for the workflow (password: password123)
      INSERT INTO users (username, email, password, name, role) VALUES
      ('priya', 'priya@customer.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Priya Kumar', 'customer'),
      ('agent_a', 'agenta@helpdesk.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Agent A', 'agent'),
      ('mr_singh', 'singh@helpdesk.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mr. Singh', 'admin');
    `;
    
    await new Promise((resolve, reject) => {
      connection.query(defaultData, (err, results) => {
        if (err) {
          console.error('❌ Error inserting default data:', err);
          reject(err);
        } else {
          console.log('✅ Default data inserted');
          resolve(results);
        }
      });
    });
    
    // Create sample ticket for Priya
    const sampleTicket = `
      INSERT INTO tickets (subject, description, priority, customer_id, sla_deadline) VALUES
      ('Order not delivered', 'Order #1234 hasn''t been delivered yet', 'high', 
       (SELECT id FROM users WHERE email = 'priya@customer.com'),
       DATE_ADD(NOW(), INTERVAL 24 HOUR));
    `;
    
    await new Promise((resolve, reject) => {
      connection.query(sampleTicket, (err, results) => {
        if (err) {
          console.error('❌ Error creating sample ticket:', err);
          reject(err);
        } else {
          console.log('✅ Sample ticket created');
          resolve(results);
        }
      });
    });
    
    console.log('🎉 Enhanced database setup completed successfully!');
    console.log('');
    console.log('📋 Test Users Created:');
    console.log('   👤 Priya (Customer): priya@customer.com / password123');
    console.log('   🎧 Agent A: agenta@helpdesk.com / password123');
    console.log('   👨💼 Mr. Singh (Admin): singh@helpdesk.com / password123');
    console.log('   🔧 System Admin: admin@helpdesk.com / password123');
    console.log('');
    console.log('🎯 Sample Ticket Created:');
    console.log('   📦 "Order not delivered" - High Priority');
    console.log('   ⏰ SLA: 24 hours from creation');
    console.log('');
    console.log('🔧 SLA Settings:');
    console.log('   🟢 Low Priority: 72 hours');
    console.log('   🔵 Medium Priority: 48 hours');
    console.log('   🟠 High Priority: 24 hours');
    console.log('   🔴 Urgent Priority: 4 hours');
    console.log('');
    console.log('🚀 Ready to start the workflow!');
    console.log('   Frontend: http://localhost:4200');
    console.log('   Backend: http://localhost:5000');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    connection.end();
  }
}

// Run the setup
setupSafeDatabase();