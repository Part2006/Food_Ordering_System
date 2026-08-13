import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import route files
import authRoutes from './routes/authRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { seedIfEmpty } from './seedHelper.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Allow any origin for local dev
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Expose Socket.io instance to routers
app.set('socketio', io);

// Middlewares
app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food_ordering';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB database.');
    seedIfEmpty();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB database:', err.message);
    console.log('Ensure MongoDB is running locally, or supply a valid MONGODB_URI.');
  });

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Food Ordering System API is running...' });
});

// Seeding trigger endpoints
app.get('/api/seed', async (req, res) => {
  try {
    await seedIfEmpty(true);
    res.json({ message: 'Database successfully cleared and seeded with default data!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/seed', async (req, res) => {
  try {
    await seedIfEmpty(true);
    res.json({ message: 'Database successfully cleared and seeded with default data!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/seed-check', async (req, res) => {
  try {
    await seedIfEmpty(false);
    res.json({ message: 'Database check and seed finished.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/seed-check', async (req, res) => {
  try {
    await seedIfEmpty(false);
    res.json({ message: 'Database check and seed finished.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'An unknown server error occurred' });
});

// Socket.io event handling
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  // Client requests to join a room
  socket.on('join', (roomName) => {
    socket.join(roomName);
    console.log(`Client ${socket.id} joined room: ${roomName}`);
  });

  // Client requests to leave a room
  socket.on('leave', (roomName) => {
    socket.leave(roomName);
    console.log(`Client ${socket.id} left room: ${roomName}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});

export default app;