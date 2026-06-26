const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = async () => {
  const conn = await require('./config/db')();
};

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/articles', require('./routes/articleRoutes'));
app.use('/api/forums', require('./routes/forumRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/dm', require('./routes/dmRoutes'));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy and running' });
});

// Custom error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 5000;

let server;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

module.exports = app;
