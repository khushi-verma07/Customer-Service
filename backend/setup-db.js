const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Create connection without specifying database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '2102',
  multipleStatements: true
});

// Read and execute SQL setup file
const sqlFile = fs.readFileSync(path.join(__dirname, '../database/setup.sql'), 'utf8');

connection.query(sqlFile, (err, results) => {
  if (err) {
    console.error('Error setting up database:', err);
    return;
  }
  console.log('✅ Database and tables created successfully!');
  connection.end();
});