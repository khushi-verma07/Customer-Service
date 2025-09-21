const bcrypt = require('bcryptjs');
const db = require('./config/db');

const createTestUsers = async () => {
  try {
    // Create test users
    const users = [
      { name: 'Admin User', email: 'admin@test.com', password: 'admin123', role: 'admin' },
      { name: 'Agent User', email: 'agent@test.com', password: 'agent123', role: 'agent' },
      { name: 'Customer User', email: 'customer@test.com', password: 'customer123', role: 'customer' }
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password)',
        [user.name, user.email, hashedPassword, user.role],
        (err, result) => {
          if (err) {
            console.error(`Error creating user ${user.email}:`, err);
          } else {
            console.log(`✅ User created/updated: ${user.email} (${user.role})`);
          }
        }
      );
    }

    setTimeout(() => {
      console.log('\n🔑 Test Login Credentials:');
      console.log('Admin: admin@test.com / admin123');
      console.log('Agent: agent@test.com / agent123');
      console.log('Customer: customer@test.com / customer123');
      process.exit(0);
    }, 1000);

  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers();