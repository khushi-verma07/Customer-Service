const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// Create connection without specifying database first
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '2102',
  multipleStatements: true
});

console.log('🔧 Fixing database issues...\n');

const setupScript = `
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS support_system;
USE support_system;

-- Drop existing tables to recreate with correct structure
DROP TABLE IF EXISTS chats;
DROP TABLE IF EXISTS sla_logs;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer', 'agent', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table
CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  agent_id INT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (agent_id) REFERENCES users(id)
);

-- Chats table
CREATE TABLE chats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  sender_id INT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- SLA Logs table
CREATE TABLE sla_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  deadline TIMESTAMP NOT NULL,
  escalated BOOLEAN DEFAULT FALSE,
  breach_time TIMESTAMP NULL,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);
`;

connection.query(setupScript, async (err, results) => {
  if (err) {
    console.error('❌ Database setup failed:', err);
    return;
  }
  
  console.log('✅ Database and tables created successfully');
  
  // Create test users
  try {
    const users = [
      { name: 'Admin User', email: 'admin@test.com', password: 'admin123', role: 'admin' },
      { name: 'Agent User', email: 'agent@test.com', password: 'agent123', role: 'agent' },
      { name: 'Customer User', email: 'customer@test.com', password: 'customer123', role: 'customer' }
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, hashedPassword, user.role],
        (err, result) => {
          if (err) {
            console.error(`❌ Error creating user ${user.email}:`, err);
          } else {
            console.log(`✅ User created: ${user.email} (${user.role})`);
          }
        }
      );
    }

    setTimeout(() => {
      console.log('\n🎉 Database fix completed!');
      console.log('\n🔑 Test Login Credentials:');
      console.log('Admin: admin@test.com / admin123');
      console.log('Agent: agent@test.com / agent123');
      console.log('Customer: customer@test.com / customer123');
      console.log('\n🚀 Now run: npm run dev');
      connection.end();
    }, 2000);

  } catch (error) {
    console.error('❌ Error creating test users:', error);
    connection.end();
  }
});