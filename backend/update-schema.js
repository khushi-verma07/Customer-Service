const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '2102',
  multipleStatements: true
});

// Drop existing database and recreate with new schema
const dropAndRecreate = `
DROP DATABASE IF EXISTS support_system;
`;

const sqlFile = fs.readFileSync(path.join(__dirname, '../database/phase2-schema.sql'), 'utf8');

connection.query(dropAndRecreate + sqlFile, (err, results) => {
  if (err) {
    console.error('Error updating database schema:', err);
    return;
  }
  console.log('✅ Phase 2 database schema completed successfully!');
  console.log('✅ All tables created: users, tickets, chats, sla_logs');
  connection.end();
});