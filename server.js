import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Ensure reliable DNS resolution for MongoDB Atlas SRV on all platforms
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if not supported in environment
}

dotenv.config();

// Import active B2B & Corporate routes
import authRoutes from './routes/auth.js';
import siteConfigRoutes from './routes/site-config.js';
import quotationRoutes from './routes/quotations.js';
import clientPortalRoutes from './routes/client-portal.js';
import productRoutes from './routes/products.js';
import uploadRoutes from './routes/upload.js';
import projectRoutes from './routes/projects.js';
import testimonialRoutes from './routes/testimonials.js';
import softwareRoutes from './routes/software.js';
import complaintRoutes from './routes/complaints.js';
import userRoutes from './routes/users.js';
import paymentRoutes from './routes/payments.js';
import internalEmailRoutes from './routes/internal-email.js';
import contactFormRoutes from './routes/contact-form.js';

// B2C Store / Regional Raffles disabled in B2B transformation:
// import eventRoutes from './routes/events.js';
// import notificationRoutes from './routes/notifications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;
const PRIMARY_HOST = (process.env.PRIMARY_GLOBAL_HOST || 'www.agenciavectore.com').toLowerCase();
const REDIRECT_HOSTS = Array.from(new Set([
  'agenciavectore.com',
  'pe.agenciavectore.com',
  ...(process.env.LEGACY_GLOBAL_HOSTS || '').split(',').map((host) => host.trim().toLowerCase()).filter(Boolean)
])).filter((h) => h !== PRIMARY_HOST);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "default-src": ["'self'", "https:", "http:", "data:", "blob:"],
      "script-src": [
        "https://cdn.jsdelivr.net/npm/@supabase/",
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
      "frame-src": [
        "'self'",
        "https://accounts.google.com/",
        "https://checkout.culqi.com",
        "https://3ds.culqi.com",
        "https://my.spline.design",
        "https://prod.spline.design",
        "https://cdn.spline.design"
      ],
      "connect-src": [
        "https://ppdirywkrmuexufadekw.supabase.co",
        "'self'",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://accounts.google.com/gsi/",
        "https://api.cloudinary.com",
        "https://vectore-agency.onrender.com",
        "https://agenciavectore.com",
        "https://www.agenciavectore.com",
        "https://pe.agenciavectore.com",
        "https://api.culqi.com",
        "https://checkout.culqi.com",
        "https://3ds.culqi.com",
        "https://my.spline.design",
        "https://prod.spline.design",
        "https://cdn.spline.design",
        "https://unpkg.com"
      ],
      "media-src": ["'self'", "https:", "blob:", "https://res.cloudinary.com"],
      "img-src": [
        "'self'",
        "data:",
        "https:",
        "http:",
        "blob:",
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com",
        "https://lh3.googleusercontent.com",
        "https://res.cloudinary.com"
      ]
    }
  },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150
});
app.use('/api/', limiter);

// CORS configuration (supports web + Vectore Flow desktop/SSO)
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5500',
    'https://vectore-agency.onrender.com',
    'https://agenciavectore.com',
    'https://www.agenciavectore.com',
    'https://pe.agenciavectore.com'
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ==================================================
// Canonical Single-Domain Unification
// Redirects agenciavectore.com and pe.agenciavectore.com -> www.agenciavectore.com
// ==================================================
app.use((req, res, next) => {
  const hostname = (req.hostname || '').toLowerCase();
  const isLocalOrPreview = hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.includes('onrender.com');
  const isApiRequest = req.path === '/api' || req.path.startsWith('/api/');

  if (!isLocalOrPreview && !isApiRequest && REDIRECT_HOSTS.includes(hostname) && hostname !== PRIMARY_HOST) {
    return res.redirect(301, `https://${PRIMARY_HOST}${req.originalUrl}`);
  }

  next();
});

// ===================================
// Static Files
// ===================================
app.use('/css', express.static(path.join(__dirname, 'css'), { maxAge: '1h' }));
app.use('/js', express.static(path.join(__dirname, 'js'), { maxAge: '1h' }));
app.use('/assets', express.static(path.join(__dirname, 'public/assets'), { maxAge: '1y', immutable: true }));
app.use(express.static(__dirname, { index: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===================================
// API Routes
// ===================================
app.use('/api/auth', authRoutes);
app.use('/api/site-config', siteConfigRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/client-portal', clientPortalRoutes);
app.use('/api/products', productRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/software', softwareRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes); // Private B2B Ticket & Admin Order Audit only
app.use('/api/internal', internalEmailRoutes);
app.use('/api/contact', contactFormRoutes);

// B2C Store modules deactivated:
// app.use('/api/events', eventRoutes);
// app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    mode: 'B2B_CORPORATE_UNIFIED',
    message: 'Vectore Corporate API is running',
    timestamp: new Date().toISOString()
  });
});

// ===================================
// Unified Corporate Page Routes
// ===================================

// Main Unified Corporate Brochure
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Legacy multi-site & store URLs cleanly redirected
app.get(['/pe', '/es', '/en'], (req, res) => {
  res.redirect(301, '/');
});

app.get('/catalogo', (req, res) => {
  res.redirect(301, '/#taller');
});

app.get('/checkout', (req, res) => {
  res.redirect(301, '/#cotizar');
});

// Corporate Client Portal & Private Ticket Payment View
app.get(['/clientes', '/portal', '/pago'], (req, res) => {
  res.set('X-Robots-Tag', 'noindex, nofollow');
  res.sendFile(path.join(__dirname, 'clientes.html'));
});

// Vectore Flow SaaS Page
app.get('/software', (req, res) => {
  res.sendFile(path.join(__dirname, 'software.html'));
});

// Legal & Corporate Compliance Pages
app.get('/terminos', (req, res) => {
  res.sendFile(path.join(__dirname, 'terminos.html'));
});

app.get('/politica-devoluciones', (req, res) => {
  res.sendFile(path.join(__dirname, 'politica-devoluciones.html'));
});

app.get('/libro-reclamaciones', (req, res) => {
  res.sendFile(path.join(__dirname, 'libro-reclamaciones.html'));
});

// Private Real Estate Investment Dossier (Accessible ONLY via direct link)
app.get('/inversiones', (req, res) => {
  res.set('X-Robots-Tag', 'noindex, nofollow');
  res.sendFile(path.join(__dirname, 'inversiones.html'));
});

// Flow Express (Mobile Quick Orders for Vectore Flow)
app.get('/vf', (req, res) => {
  res.set('X-Robots-Tag', 'noindex, nofollow');
  res.sendFile(path.join(__dirname, 'flow-express.html'));
});

// Catch-all -> Serve Unified Corporate Home
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'Route not found' });
  }
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

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');

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
    }

    app.listen(PORT, () => {
      console.log(`🚀 Vectore B2B Server running on port ${PORT}`);
      console.log(`📍 API available at http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

export default app;
