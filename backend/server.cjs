// backend/server.cjs

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database.cjs');

// Import routes
const authRoutes = require('./routes/auth.cjs');
const studentRoutes = require('./routes/students.cjs');
const quizRoutes = require('./routes/quizzes.cjs');
const chatRoutes = require('./routes/chat.cjs');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method !== 'GET') {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  const oldJson = res.json;
  res.json = function (data) {
    if (req.path === '/api/auth/me') {
      console.log('[DEBUG] Sending profile:', JSON.stringify(data.user?.suggestedResources?.length, null, 2), 'resources');
    }
    return oldJson.apply(res, arguments);
  };
  next();
});

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'EduPath Backend is running successfully',
    version: '2.0.0',
    database: 'MongoDB'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/chat', chatRoutes);

// Fallback chat endpoint (kept for backwards compatibility)
app.post('/api/chat-fallback', (req, res) => {
  // Redirect to new chat fallback route
  req.url = '/api/chat/fallback';
  chatRoutes(req, res);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
