const db = require('./config/db');

console.log('🔍 System Health Check...\n');

// Check database connection
db.query('SELECT 1', (err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    return;
  }
  console.log('✅ Database connection: OK');
  
  // Check if database exists
  db.query('SELECT DATABASE() as db_name', (err, results) => {
    if (err) {
      console.error('❌ Database check failed:', err.message);
      return;
    }
    console.log(`✅ Database: ${results[0].db_name}`);
    
    // Check tables
    const tables = ['users', 'tickets', 'chats', 'sla_logs'];
    let tableChecks = 0;
    
    tables.forEach(table => {
      db.query(`SELECT COUNT(*) as count FROM ${table}`, (err, results) => {
        if (err) {
          console.error(`❌ Table ${table}: NOT FOUND`);
        } else {
          console.log(`✅ Table ${table}: ${results[0].count} records`);
        }
        
        tableChecks++;
        if (tableChecks === tables.length) {
          // Check test users
          db.query('SELECT email, role FROM users', (err, results) => {
            if (err) {
              console.error('❌ Users check failed:', err.message);
            } else {
              console.log('\n👥 Test Users:');
              results.forEach(user => {
                console.log(`   ${user.email} (${user.role})`);
              });
            }
            
            console.log('\n🚀 System Status: Ready to start');
            console.log('Run: npm run dev');
            db.end();
          });
        }
      });
    });
  });
});