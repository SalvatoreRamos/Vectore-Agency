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
import softwareRoutes from './routes/software.js';
import complaintRoutes from './routes/complaints.js';
import notificationRoutes from './routes/notifications.js';
import userRoutes from './routes/users.js';
import paymentRoutes from './routes/payments.js';
import internalEmailRoutes from './routes/internal-email.js';
import contactFormRoutes from './routes/contact-form.js';

// Import subdomain middleware
import { subdomainMiddleware } from './middleware/i18n.js';

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
        "'unsafe-eval'",
        "'wasm-unsafe-eval'",
        "blob:",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://accounts.google.com/gsi/client",
        "https://accounts.google.com/gsi/",
        "https://checkout.culqi.com",
        "https://js.culqi.com",
        "https://3ds.culqi.com",
        "https://my.spline.design",
        "https://prod.spline.design",
        "https://cdn.spline.design",
        "https://default.spline.design",
        "https://unpkg.com"
      ],
      "script-src-attr": ["'unsafe-inline'"],
      "style-src": [
        "'self'",
        "'unsafe-inline'",
        "https://accounts.google.com/gsi/style",
        "https://fonts.googleapis.com"
      ],
      "worker-src": ["'self'", "blob:"],
      "frame-src": ["'self'", "https://accounts.google.com/", "https://checkout.culqi.com", "https://3ds.culqi.com", "https://my.spline.design", "https://prod.spline.design", "https://cdn.spline.design"],
      "connect-src": [
        "'self'",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://accounts.google.com/gsi/",
        "https://api.cloudinary.com",
        "https://vectore-agency.onrender.com",
        "https://agenciavectore.com",
        "https://www.agenciavectore.com",
        "https://api.culqi.com",
        "https://checkout.culqi.com",
        "https://3ds.culqi.com",
        "https://my.spline.design",
        "https://prod.spline.design",
        "https://cdn.spline.design",
        "https://unpkg.com"
      ],
      "img-src": ["'self'", "data:", "https:", "http:", "blob:", "https://www.google-analytics.com", "https://www.googletagmanager.com", "https://lh3.googleusercontent.com"]
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

// ===================================
// Static Files
// ===================================
// New organized assets (CSS, JS, images)
app.use('/css', express.static(path.join(__dirname, 'css'), { maxAge: '7d' }));
app.use('/js', express.static(path.join(__dirname, 'js'), { maxAge: '7d' }));
app.use('/assets', express.static(path.join(__dirname, 'public/assets'), { maxAge: '1y', immutable: true }));

// Legacy static files (existing root files: SVGs, favicon, etc.)
app.use(express.static(__dirname, {
  // Don't serve index.html from root — we handle routing explicitly
  index: false
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===================================
// API Routes
// ===================================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/software', softwareRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/internal', internalEmailRoutes);
app.use('/api/contact', contactFormRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Vectore API is running',
    timestamp: new Date().toISOString()
  });
});

// ===================================
// Subdomain Middleware (must be after API routes)
// Detects pe.agenciavectore.com vs agenciavectore.com
// ===================================
app.use(subdomainMiddleware);

// ===================================
// Page Routes — Subdomain-based
// ===================================

// Home
app.get('/', (req, res) => {
  if (req.site === 'pe') {
    // Peru: serve the existing light-mode tienda
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  // Global: serve the new premium EN landing
  res.sendFile(path.join(__dirname, 'views/en/index.html'));
});

// Software / Vectore Flow
app.get('/software', (req, res) => {
  if (req.site === 'pe') {
    return res.sendFile(path.join(__dirname, 'software.html'));
  }
  const enPath = path.join(__dirname, 'views/en/software.html');
  const legacyPath = path.join(__dirname, 'software.html');
  res.sendFile(enPath, (err) => {
    if (err) res.sendFile(legacyPath);
  });
});

// Checkout (Peru only)
app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'checkout.html'));
});

// Legal Pages (Peru)
app.get('/terminos', (req, res) => {
  res.sendFile(path.join(__dirname, 'terminos.html'));
});

app.get('/politica-devoluciones', (req, res) => {
  res.sendFile(path.join(__dirname, 'politica-devoluciones.html'));
});

app.get('/libro-reclamaciones', (req, res) => {
  res.sendFile(path.join(__dirname, 'libro-reclamaciones.html'));
});

// ===================================
// Catch-all: Serve site-appropriate page
// ===================================
app.get('*', (req, res) => {
  if (req.site === 'pe') {
    // Peru: serve the existing index.html for any unknown route
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  // Global: serve premium EN landing
  res.sendFile(path.join(__dirname, 'views/en/index.html'));
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
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    // Drop stale indexes that conflict with current schema
    try {
      const db = mongoose.connection.db;
      const usersCollection = db.collection('users');
      const indexes = await usersCollection.indexes();
      const staleIndexes = ['username_1'];
      for (const idx of indexes) {
        if (staleIndexes.includes(idx.name)) {
          await usersCollection.dropIndex(idx.name);
          console.log('🧹 Dropped stale index:', idx.name);
        }
      }
    } catch (e) {
      // Ignore if index doesn't exist
      console.log('Index cleanup skipped:', e.message);
    }

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
