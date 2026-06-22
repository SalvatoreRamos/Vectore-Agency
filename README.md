# Vectore Agency - Landing Page & Admin API

Sitio web oficial de **Vectore**, la agencia publicitaria líder en Pucallpa. Especializada en diseño gráfico, marketing digital, gigantografías, rotulación vehicular y merchandising.

## 🚀 Características

- **Diseño Moderno & Premium** - UI/UX optimizada con dark mode y animaciones fluidas.
- **Portafolio Dinámico** - Visualización de trabajos realizados con navegación intuitiva.
- **Catálogo de Servicios** - Exploración detallada de productos digitales y físicos.
- **Integración con WhatsApp** - Canal directo de atención al cliente para ventas y soporte.
- **Optimización SEO** - Estructura orientada a palabras clave de servicios publicitarios en Pucallpa.
- **Sorteos & Eventos** - Sistema integrado para participación en sorteos regionales.
- **Panel de Administración** - Gestión completa de productos, proyectos y testimonios.
- **Seguridad & Rendimiento** - Construido con Node.js, Express y MongoDB con mejores prácticas.

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- MongoDB (local o MongoDB Atlas)
- Cuenta de Stripe (para pagos)
- Cuenta de PayPal Developer (para pagos)
- API Key de OpenAI (opcional, para cotizaciones con IA)

## 🛠️ Instalación

1. **Clonar el repositorio** (o navegar al directorio)

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Copiar el archivo de ejemplo
copy .env.example .env

# Editar .env con tus credenciales
```

4. **Configurar MongoDB**
   - Instalar MongoDB localmente, o
   - Crear una cuenta en MongoDB Atlas y obtener la URI de conexión

5. **Poblar la base de datos** (opcional)
```bash
npm run seed
```

## 🔧 Configuración

Edita el archivo `.env` con tus credenciales:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/vectore-agency

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura

# OpenAI (opcional)
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox

# Frontend
FRONTEND_URL=http://localhost:5500
```

## 🚀 Uso

### Modo Desarrollo
```bash
npm run dev
```

### Modo Producción
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📡 Endpoints de la API

### Autenticación (`/api/auth`)
- `POST /register` - Registrar nuevo usuario
- `POST /login` - Iniciar sesión
- `GET /me` - Obtener usuario actual (requiere auth)
- `PUT /profile` - Actualizar perfil (requiere auth)
- `PUT /change-password` - Cambiar contraseña (requiere auth)

### Productos (`/api/products`)
- `GET /` - Listar productos (con filtros y paginación)
- `GET /:id` - Obtener producto por ID
- `POST /` - Crear producto (admin)
- `PUT /:id` - Actualizar producto (admin)
- `DELETE /:id` - Eliminar producto (admin)
- `GET /category/:category` - Productos por categoría
- `GET /featured/list` - Productos destacados

### Órdenes (`/api/orders`)
- `POST /` - Crear nueva orden
- `GET /` - Listar órdenes (requiere auth)
- `GET /:id` - Obtener orden por ID
- `POST /:id/payment/stripe` - Procesar pago con Stripe
- `POST /:id/payment/confirm` - Confirmar pago
- `PUT /:id/status` - Actualizar estado de orden (admin)

### Cotizaciones (`/api/quotations`)
- `POST /` - Crear cotización (con sugerencias de IA)
- `GET /` - Listar cotizaciones (requiere auth)
- `GET /:id` - Obtener cotización por ID
- `PUT /:id` - Actualizar cotización (admin)
- `PUT /:id/status` - Actualizar estado (admin)
- `POST /:id/accept` - Aceptar cotización
- `DELETE /:id` - Eliminar cotización (admin)

### Subida de Archivos (`/api/upload`)
- `POST /image` - Subir una imagen (admin)
- `POST /images` - Subir múltiples imágenes (admin)

## 🔐 Autenticación

La API usa JWT (JSON Web Tokens) para autenticación. Para acceder a rutas protegidas:

1. Hacer login en `/api/auth/login`
2. Usar el token recibido en el header:
```
Authorization: Bearer <token>
```

## 👤 Usuario Administrador por Defecto

Después de ejecutar `npm run seed`:
- **Email**: admin@vectore.com
- **Password**: Admin123!

## 📁 Estructura del Proyecto

```
├── models/           # Modelos de Mongoose
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   └── Quotation.js
├── routes/           # Rutas de la API
│   ├── auth.js
│   ├── products.js
│   ├── orders.js
│   ├── quotations.js
│   └── upload.js
├── middleware/       # Middleware personalizado
│   └── auth.js
├── uploads/          # Archivos subidos
├── server.js         # Punto de entrada
├── seed.js           # Script de población de datos
└── .env             # Variables de entorno
```

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Tokens JWT con expiración
- Rate limiting para prevenir ataques
- Helmet para headers de seguridad
- Validación de datos con express-validator
- CORS configurado

## 🌐 Integración con Frontend

El frontend debe hacer peticiones a `http://localhost:3000/api`

Ejemplo de petición:
```javascript
const response = await fetch('http://localhost:3000/api/products');
const data = await response.json();
```

## 📝 Notas

- Las imágenes se guardan en la carpeta `uploads/`
- Los productos pueden ser digitales o físicos
- Las cotizaciones tienen fecha de expiración (30 días)
- Los pagos con Stripe requieren configuración adicional en el frontend

## 🐛 Troubleshooting

**Error de conexión a MongoDB:**
- Verificar que MongoDB esté corriendo
- Verificar la URI de conexión en `.env`

**Error de OpenAI:**
- Verificar que la API key sea válida
- El sistema funciona sin OpenAI, solo no generará sugerencias automáticas

**Error de Stripe:**
- Verificar las credenciales en `.env`
- Usar claves de test para desarrollo

## 📄 Licencia

ISC
