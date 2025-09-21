const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
});

async function setupEnhancedDatabase() {
  try {
    console.log('🚀 Setting up enhanced customer support database...');
    
    // Read the enhanced schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'enhanced-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await new Promise((resolve, reject) => {
      connection.query(schema, (err, results) => {
        if (err) {
          console.error('❌ Error executing schema:', err);
          reject(err);
        } else {
          console.log('✅ Enhanced database schema created successfully');
          resolve(results);
        }
      });
    });
    
    console.log('🎉 Enhanced database setup completed!');
    console.log('');
    console.log('📋 Test Users Created:');
    console.log('   👤 Priya (Customer): priya@customer.com / password123');
    console.log('   🎧 Agent A: agenta@helpdesk.com / password123');
    console.log('   👨‍💼 Mr. Singh (Admin): singh@helpdesk.com / password123');
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
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    connection.end();
  }
}

// Run the setup
setupEnhancedDatabase();