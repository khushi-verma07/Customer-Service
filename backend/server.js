const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

// Import services and routes
const { startSLAMonitoring } = require('./services/slaService');
const { handleSocketConnection } = require('./services/socketService');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reportRoutes = require('./routes/reportRoutes');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: ["http://localhost:4200", "http://127.0.0.1:4200"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  } 
});

// Enhanced CORS configuration
app.use(cors({
  origin: ["http://localhost:4200", "http://127.0.0.1:4200"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Health check route
app.get("/", (req, res) => res.json({ 
  message: "Customer Support API is running...",
  status: "healthy",
  timestamp: new Date().toISOString()
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/tickets', chatRoutes);
app.use('/api/reports', reportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Socket.IO setup
handleSocketConnection(io);

// Start SLA monitoring
startSLAMonitoring();

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('✅ All backend features active:');
  console.log('   - JWT Authentication');
  console.log('   - Ticket Management APIs');
  console.log('   - Chat APIs');
  console.log('   - Reports APIs');
  console.log('   - SLA Monitoring');
  console.log('   - Socket.IO Live Chat');
  console.log('   - Admin Dashboard Support');
  console.log('\n🔗 Frontend: http://localhost:4200');
  console.log('🔑 Test Users: admin@test.com, agent@test.com, customer@test.com');
  console.log('🔒 Password: admin123, agent123, customer123');
});