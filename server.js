import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import uploadRoutes from './routes/upload.js';
import projectRoutes from './routes/projects.js';
import testimonialRoutes from './routes/testimonials.js';
import eventRoutes from './routes/events.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Render)
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "default-src": ["'self'", "https:", "http:", "data:", "blob:"],
      "script-src": [
        "'self'",
        "'unsafe-inline'",
        "blob:",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://accounts.google.com/gsi/client"
      ],
      "worker-src": ["'self'", "blob:"],
      "frame-src": ["'self'", "https://accounts.google.com/"],
      "connect-src": [
        "'self'",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://accounts.google.com/gsi/",
        "https://api.cloudinary.com",
        "https://vectore-agency.onrender.com",
        "https://agenciavectore.com",
        "https://www.agenciavectore.com"
      ],
      "img-src": ["'self'", "data:", "https:", "http:", "blob:", "https://www.google-analytics.com", "https://www.googletagmanager.com"]
    },
  },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false,
}));


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5500',
    'https://vectore-agency.onrender.com',
    'https://agenciavectore.com',
    'https://www.agenciavectore.com'
  ],
  credentials: true
}));


// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (Frontend)
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/events', eventRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Vectore API is running',
    timestamp: new Date().toISOString()
  });
});

// Serve index.html for any other route (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API available at http://localhost:${PORT}/api`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

export default app;
