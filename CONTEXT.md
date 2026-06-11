# CONTEXT.md — Vectore Agency Codebase

> **Purpose:** This file contains everything an AI assistant needs to understand, navigate, and modify this codebase. Read this first before making any changes.

---

## 1. What Is This Project?

**Vectore** is a creative studio / advertising agency based in Pucallpa, Peru. This repository is a **full-stack Express.js monolith** that serves **two distinct websites** from a single codebase via subdomain-based routing:

| Property | Global Site | Peru Site |
|----------|-------------|-----------|
| **Domain** | `www.agenciavectore.com` | `pe.agenciavectore.com` |
| **Language** | English | Spanish |
| **Purpose** | International lead gen, premium positioning | Local e-commerce, catalog, events, payments |
| **Theme** | Dark/Light toggle (data-theme attribute) | Light mode only (fixed) |
| **Entry HTML** | `views/en/index.html` | `index.html` (root) |
| **CSS** | Modular: `css/design-system.css`, `css/global.css`, `css/hero.css`, etc. | Monolithic: `styles.css` |
| **JS** | ES Modules: `js/core/app.js` → imports from `js/components/*` | Classic scripts: `script.js`, `cart.js`, `events.js` |
| **Form** | Multi-step qualifying form → `/api/contact/qualify` → Lead model | WhatsApp CTA direct link |
| **Payments** | None | Culqi (card + Yape), WhatsApp manual checkout |
| **3D** | Spline hana-viewer (dark + light scenes) | Floating CSS shapes |
| **Analytics** | GTM (`GTM-W8RCKKSV`) + GA4 (`G-Y0YGQ6DDHK`) | Same |

---

## 2. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Runtime** | Node.js 18+ | ES Modules (`"type": "module"` in package.json) |
| **Framework** | Express 4.x | With Helmet, CORS, rate-limit |
| **Database** | MongoDB via Mongoose 8.x | Atlas in production, local for dev |
| **Auth** | JWT (jsonwebtoken) + bcryptjs | Google OAuth optional |
| **Payments** | Culqi API (PEN currency) | Card charges, Yape, PagoEfectivo, webhooks |
| **File Upload** | Multer + Cloudinary | `multer-storage-cloudinary` |
| **Email** | Nodemailer | Gmail (prod), Ethereal fallback (dev) |
| **AI** | Google Generative AI (`@google/generative-ai`) | Present in deps, usage TBD |
| **3D** | Spline (hana-viewer web component) | Two scenes: dark + light |
| **Deployment** | Render.com | `render.yaml`, 3 custom domains |
| **Frontend** | Vanilla HTML/CSS/JS | No framework, no bundler |
| **Fonts** | Inter (Google Fonts) | Weights: 300-900 |

---

## 3. Subdomain Routing — How It Works

**File:** `middleware/i18n.js`

The middleware reads `req.hostname`:
- `pe.*` → `req.site = 'pe'`
- `localhost` → reads `?_site=pe` query param (dev simulation), defaults to `'global'`
- Everything else → `req.site = 'global'`

Then in `server.js`, route handlers branch on `req.site`:

```javascript
app.get('/', (req, res) => {
    if (req.site === 'pe') {
        return res.sendFile(path.join(__dirname, 'index.html'));
    }
    res.sendFile(path.join(__dirname, 'views/en/index.html'));
});
```

**Important:** The subdomain middleware runs **after** API routes. API endpoints are site-agnostic.

**Canonical redirect:** Bare `agenciavectore.com` (without www) redirects 301 → `www.agenciavectore.com`.

---

## 4. Data Models (Mongoose Schemas)

### User (`models/User.js`)
- Fields: `email` (unique), `googleId` (sparse unique), `password`, `name`, `role` (admin/user), `avatar`, `isActive`, `isVerified`, `resetPasswordToken/Expire`, `lastLogin`
- **Pre-save hook:** bcrypt hash password
- **Methods:** `comparePassword()`, `getResetPasswordToken()`, `getVerificationToken()`
- **toJSON:** strips password, tokens

### Product (`models/Product.js`)
- Categories enum: `diseno`, `impresion`, `packaging`, `senalizacion`, `vinilo`, `digital`, `espacios`
- Fields: `name`, `description`, `category`, `subcategory`, `price` (PEN), `deliveryTime`, `material`, `unit`, `minQuantity`, `dimensions`, `images[]`, `features[]`, `specifications` (Map), `stock`, `isAvailable`, `tags[]`, `rating`, `createdBy`
- **Text index:** on name, description, tags
- **Virtual:** `primaryImage`

### Order (`models/Order.js`)
- Fields: `orderNumber` (auto: VEC-YYMM-0001), `user`, `items[]`, `subtotal`, `tax`, `total`, `status` (pending→paid→processing→shipped→delivered / failed/refunded/cancelled), `paymentMethod` (culqi_card/culqi_yape/whatsapp/pending), Culqi fields (`culqiChargeId`, `culqiTokenId`, `culqiOrderId`, `culqiResponse`), customer details, shipping address
- **Indexes:** by user+createdAt, status, orderNumber

### Lead (`models/Lead.js`)
- Fields: `name`, `email`, `company`, `service` (ai_agents/3d_renders/branding/saas/other), `timeline` (asap/1-2_months/3+_months/exploring), `budget` (under_5k/5k-15k/15k-50k/50k+/not_sure), `description`, `qualificationScore` (0-100 auto-calculated), `priority` (low/medium/high), `status` (new/contacted/qualified/closed), `internalNotes`, `readAt`, `respondedAt`, `closedAt`, `source` (en/es)
- **Pre-save hook:** Calculates score from budget (0-50) + timeline (0-30) + service (0-20), auto-sets priority

### Project (`models/Project.js`)
- Fields: `title`, `client`, `category`, `description`, `thumbnail`, `images[]` (with captions), `tags[]`, `date`, `isFeatured`, `scope` (local/global)

### Testimonial (`models/Testimonial.js`)
- Fields: `clientName`, `businessName`, `comment` (max 300), `photo`, `isActive`, `order`

### Event (`models/Event.js`)
- Fields: `title`, `description`, `prize`, `prizeImage`, `startDate`, `endDate`, `isActive`, `terms`, `winner` (refs Participant)

### Participant (`models/Participant.js`)
- Fields: `event`, `name`, `phone`, `ticketId`, `ipAddress` (select: false)
- **Compound index:** event+phone unique (one entry per phone per event)

### Complaint (`models/Complaint.js`)
- Auto-numbered: `REC-YYYY-0001`
- Consumer info (name, docType/Number, email, phone, address, isMinor/parentName)
- Product info (type: Producto/Servicio, description, amount)
- Complaint info (type: Reclamo/Queja, detail, consumerRequest)
- Status: Pendiente → En proceso → Resuelto → Cerrado

### Notification (`models/Notification.js`)
- Fields: `title`, `message`, `type` (offer/winner/general), `target` (all/specific), `targetUsers[]`, `readBy[]`, `isActive`

### SoftwareAsset (`models/SoftwareAsset.js`)
- Fields: `title`, `description`, `url`, `section` (hero/features/gallery/mockup/general)

---

## 5. API Route Files

All routes are mounted under `/api/` in `server.js`:

| Mount | File | Key patterns |
|-------|------|-------------|
| `/api/auth` | `routes/auth.js` | Login, register, Google OAuth, password reset, profile |
| `/api/products` | `routes/products.js` | CRUD, category filter, featured, search |
| `/api/payments` | `routes/payments.js` | Culqi charges + orders, user orders, admin orders/stats, webhooks |
| `/api/contact` | `routes/contact-form.js` | Lead qualifying form, admin inbox |
| `/api/projects` | `routes/projects.js` | Portfolio CRUD |
| `/api/testimonials` | `routes/testimonials.js` | Testimonial CRUD |
| `/api/events` | `routes/events.js` | Event CRUD, participant registration, winner draw |
| `/api/complaints` | `routes/complaints.js` | Complaint submission |
| `/api/notifications` | `routes/notifications.js` | Notification CRUD |
| `/api/upload` | `routes/upload.js` | Cloudinary image upload (single/multi) |
| `/api/software` | `routes/software.js` | Software asset CRUD |
| `/api/users` | `routes/users.js` | User listing (admin only) |
| `/api/internal` | `routes/internal-email.js` | Internal email sending |

---

## 6. Authentication & Authorization

**File:** `middleware/auth.js`

Three middleware functions:
- `authenticate` — Verifies JWT token from `Authorization: Bearer <token>`, attaches `req.user`
- `isAdmin` — Checks `req.user.role === 'admin'`
- `optionalAuth` — Like authenticate but doesn't fail if no token

**JWT secret:** `process.env.JWT_SECRET` with hardcoded fallback (for backwards compat)

**Note:** The `payments.js` route has its OWN inline auth middleware that checks `decoded.email === process.env.ADMIN_EMAIL` for admin routes. This is separate from the shared `middleware/auth.js`.

---

## 7. Frontend Architecture

### Global Site (English)

**Entry:** `views/en/index.html`

**CSS (loaded in order):**
1. `css/design-system.css` — CSS custom properties (`--accent-primary`, `--bg-primary`, etc.), dark/light theme via `[data-theme]`, typography scale, spacing tokens
2. `css/global.css` — Layout, navbar (scrolled state), footer, preloader, geo-banner, cursor
3. `css/hero.css` — Hero section, Spline container, orbs, mobile floating shapes, hero-lite
4. `css/components.css` — Buttons (`.btn--primary`, `.btn--ghost`), badges, cards, forms
5. `css/services.css` — Service cards grid (`.services-grid`), featured card, tilt
6. `css/portfolio.css` — Horizontal scroll track, overlay, navigation
7. `css/contact.css` — Multi-step form, progress bar, options, success state

**JS (ES Modules):**
- `js/core/app.js` — Entry point. Imports and calls init functions:
  - `initCursor()` — Custom cursor (ring + dot)
  - `initThemeToggle()` — Dark/light toggle
  - `initNavbarScroll()` — Adds `.scrolled` class on scroll
  - `initMobileNav()` — Full mobile nav with history API integration
  - `initSmoothScroll()` — Anchor scrolling
  - `initScrollReveal()` — IntersectionObserver for `.reveal` elements
  - `initCounters()` — Animated number counters (`data-count-target`)
  - `initTiltEffect()` — 3D perspective tilt on `[data-tilt]` cards
  - `initMagneticButtons()` — Mouse-follow effect on buttons
  - `initParallaxOrbs()` — Mouse-reactive ambient orbs
  - `initSplineViewer()` — Lazy-loads Spline 3D
  - `initSmartForm()` — Multi-step qualifying form
  - `initGeoBanner()` — Peru geo-detection
  - `initPortfolioScroll()` — Horizontal scroll navigation
  - `initPreloader()` — Fade-out preloader on load

**Inline scripts in HTML:**
- Spline watermark removal (querySelectorAll hana-viewer → shadowRoot → remove #logo)
- Mobile hero-lite toggle (≤768px → show lite, hide Spline)
- Dynamic portfolio + software asset loader from API
- Additional mobile nav accessibility

### Peru Site (Spanish)

**Entry:** `index.html` (root)

**CSS:** `styles.css` (monolithic), `events.css`, `legal.css`, `cart.css`

**JS (classic scripts, not modules):**
- `api-client.js` — `VectoreAPI` class with methods for all endpoints
- `script.js` — Main Peru site logic (catalog, portfolio, testimonials, modals, counters, cursor, cart integration, WhatsApp links)
- `cart.js` — Shopping cart (add/remove/update, WhatsApp checkout message builder, Culqi payment flow)
- `events.js` — Giveaway balloon animation, countdown timer, participant registration
- `cursor.js` — Custom cursor for Peru site

### Admin Panel

**Files:** `admin.html`, `admin.js`, `admin.css`

Single-page dashboard with tabbed sections for managing all data.

---

## 8. Design System (Global Site)

**File:** `css/design-system.css`

Key CSS custom properties:
```css
--accent-primary: #8655FF;       /* Purple - brand color */
--accent-secondary: #FF6B6B;     /* Coral - secondary */
--bg-primary, --bg-secondary, --bg-elevated, --bg-card
--text-primary, --text-secondary, --text-tertiary
--glass-bg, --glass-border       /* Glassmorphism */
--shadow-sm, --shadow-md, --shadow-lg, --shadow-xl
--radius-sm, --radius-md, --radius-lg, --radius-xl, --radius-full
--ease-out-expo, --ease-out-quint
```

Theming via `[data-theme="light"]` selector overrides. Default is dark.

---

## 9. Payment Flow (Peru Site Only)

1. User adds items to cart (`cart.js`)
2. At checkout (`checkout.html`), user either:
   - **WhatsApp checkout** — Generates a formatted WhatsApp message with order details
   - **Card payment** — Culqi tokenization → `/api/payments/create-charge`
   - **Yape/PagoEfectivo** — Culqi order → `/api/payments/create-order` → `/api/payments/confirm-order`
3. On success, an email confirmation is sent via Nodemailer
4. Webhooks from Culqi update order status asynchronously

**Currency:** Peruvian Soles (PEN). Amounts in Culqi are in **centavos** (e.g., 5000 = S/ 50.00).

---

## 10. Lead Qualification Flow (Global Site)

1. User fills multi-step form (service → timeline → budget → contact details)
2. Frontend POSTs to `/api/contact/qualify`
3. `Lead` model pre-save hook auto-calculates `qualificationScore` (0-100):
   - Budget: 50k+ = 50pts, 15k-50k = 40pts, 5k-15k = 25pts, under_5k = 10pts
   - Timeline: ASAP = 30pts, 1-2 months = 25pts, 3+ months = 15pts
   - Service: AI = 20pts, SaaS = 18pts, 3D = 15pts, Branding = 12pts
4. Priority auto-assigned: ≥60 = high, ≥35 = medium, else low
5. Admin sees leads in admin panel's Brief Inbox with scores, status, and filters

---

## 11. Event/Giveaway System (Peru Site)

1. Admin creates an event in admin panel (title, prize, dates, terms)
2. Active event shows a floating balloon on the Peru site
3. Clicking opens a modal with countdown, prize image, and registration form
4. Participants register with name + phone (unique per event)
5. System generates a ticket ID (VEC-XXXXXX)
6. Admin can draw a random winner from admin panel

---

## 12. Deployment Configuration

**File:** `render.yaml`

```yaml
services:
  - type: web
    name: vectore-agency
    env: node
    plan: starter
    buildCommand: npm install
    startCommand: npm start
    customDomains:
      - name: www.agenciavectore.com
      - name: agenciavectore.com
      - name: pe.agenciavectore.com
```

**Trust proxy:** `app.set('trust proxy', 1)` — Required for Render's reverse proxy.

**301 Redirect:** Bare domain → www via Express middleware (checks `LEGACY_GLOBAL_HOSTS`).

---

## 13. SEO Configuration

- `robots.txt` — Allows all, disallows admin/api/uploads
- `sitemap.xml` — Multi-site with hreflang annotations (en, es-PE, x-default)
- Both sites have `<link rel="canonical">` and hreflang tags
- JSON-LD structured data (ProfessionalService for global, AdvertisingAgency for Peru)
- Open Graph + Twitter Card meta tags

---

## 14. Key Files Quick Reference

| File | Purpose | Size |
|------|---------|------|
| `server.js` | Express app + routing + MongoDB connect | ~310 lines |
| `seed.js` | Seeds admin + 28 products | ~496 lines |
| `api-client.js` | Frontend API wrapper class | ~316 lines |
| `admin.js` | Full admin dashboard logic | ~90K |
| `script.js` | Peru site main logic | ~37K |
| `cart.js` | Shopping cart + Culqi integration | ~35K |
| `styles.css` | Peru site styles | ~47K |
| `views/en/index.html` | Global landing page | ~48K |
| `index.html` | Peru landing page | ~41K |

---

## 15. Common Modification Patterns

### Adding a new API route:
1. Create model in `models/NewModel.js`
2. Create route in `routes/new-route.js`
3. Import and mount in `server.js`: `app.use('/api/new', newRoutes)`
4. Add client methods in `api-client.js`

### Adding a new section to the Global site:
1. Add CSS file in `css/new-section.css`
2. Link it in `views/en/index.html` `<head>`
3. Add HTML section in `views/en/index.html`
4. If it needs JS, add to `js/components/new-component.js` and import in `js/core/app.js`

### Adding a new section to the Peru site:
1. Add styles to `styles.css`
2. Add HTML to `index.html`
3. Add JS logic to `script.js`

### Changing the theme/colors:
- Edit CSS custom properties in `css/design-system.css`
- Brand purple: `#8655FF`

### Adding admin functionality:
- Add HTML tab/section in `admin.html`
- Add logic in `admin.js`
- Add styles in `admin.css`

---

## 16. Known Patterns & Conventions

1. **ES Modules everywhere** — Both server and global site use `import/export`. Peru site uses classic `<script>` tags.
2. **API responses** follow format: `{ success: true, data: ... }` or `{ success: false, message: '...' }`
3. **Versioned CSS/JS** — Global site uses `?v=22` query params for cache busting
4. **Auth token storage** — `localStorage.setItem('authToken', token)` via `api-client.js`
5. **Image uploads** — Always go through Cloudinary (never local), via `/api/upload/image`
6. **No build step** — No webpack, no Vite, no bundler. Files are served directly by Express.
7. **Product categories** use Spanish slugs: `diseno`, `impresion`, `packaging`, `senalizacion`, `vinilo`, `digital`, `espacios`
8. **Currency** is always PEN (Peruvian Soles) in the database and Culqi integration

---

## 17. Environment Variables Reference

```env
# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5500

# Site URLs
SITE_URL=https://www.agenciavectore.com
PERU_SITE_URL=https://pe.agenciavectore.com

# Domain routing
PRIMARY_GLOBAL_HOST=www.agenciavectore.com
LEGACY_GLOBAL_HOSTS=agenciavectore.com

# Database
MONGODB_URI=mongodb://localhost:27017/vectore-agency

# Auth
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@vectore.com
ADMIN_PASSWORD=Admin123!

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your@gmail.com
EMAIL_PASS=app-password
CONTACT_EMAIL=receive@gmail.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Google OAuth
GOOGLE_CLIENT_ID=xxx

# Culqi Payments
CULQI_PUBLIC_KEY=pk_live_xxx
CULQI_SECRET_KEY=sk_live_xxx
CULQI_RSA_ID=xxx
CULQI_RSA_PUBLIC_KEY=xxx
```

---

## 18. Social & Contact Info

- **Phone/WhatsApp:** +51 950 699 910
- **Email:** agenciavectore@gmail.com
- **Address:** Jr. Tarapacá 390, Callería, Pucallpa, Ucayali, Peru
- **Instagram:** [@vectore_ap](https://www.instagram.com/vectore_ap/)
- **Facebook:** [Vectore](https://www.facebook.com/share/1AyNTc8kkm/)
- **TikTok:** [@salvatoreee_26](https://www.tiktok.com/@salvatoreee_26)
- **GTM ID:** GTM-W8RCKKSV
- **GA4 ID:** G-Y0YGQ6DDHK
