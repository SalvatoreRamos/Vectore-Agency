# Guía de Configuración — Vectore Agency

Guía paso a paso para levantar el proyecto localmente desde cero.

---

## 📋 Requisitos Previos

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| Node.js | v18+ | Runtime del servidor |
| npm | v9+ | Gestor de paquetes (incluido con Node) |
| MongoDB | v6+ o Atlas | Base de datos |
| Git | Cualquiera | Control de versiones |

---

## 1. Instalar Dependencias

```bash
npm install
```

Esto instala: Express, Mongoose, Helmet, JWT, Bcrypt, Multer, Cloudinary, Nodemailer, Culqi (vía fetch), entre otros.

---

## 2. Configurar Variables de Entorno

```bash
copy .env.example .env
```

Edita `.env` con tus credenciales. A continuación la guía para cada servicio:

### 2.1 MongoDB

#### Opción A: MongoDB Atlas (Recomendado)

1. Crear cuenta gratuita en: https://www.mongodb.com/cloud/atlas/register
2. Crear un cluster Free Tier (M0)
3. Configurar acceso:
   - **Database Access:** Crear usuario con contraseña
   - **Network Access:** Agregar tu IP o `0.0.0.0/0` para desarrollo
4. Copiar la URI de conexión:
   - Click en "Connect" → "Connect your application"
   - Formato: `mongodb+srv://usuario:password@cluster.mongodb.net/vectore-agency`
5. Pegar en `.env`:
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/vectore-agency
```

#### Opción B: MongoDB Local (Windows)

1. Descargar desde: https://www.mongodb.com/try/download/community
2. Instalar (se ejecuta como servicio de Windows)
3. Verificar:
```bash
mongod --version
```
4. Usar la URI local:
```env
MONGODB_URI=mongodb://localhost:27017/vectore-agency
```

### 2.2 JWT Secret

Generar una clave secreta segura:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

```env
JWT_SECRET=tu_clave_generada_aqui
```

### 2.3 Cloudinary (Subida de Imágenes)

1. Crear cuenta en: https://cloudinary.com/
2. Ir al Dashboard y copiar:
   - Cloud name
   - API key
   - API secret

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

> **Sin Cloudinary:** La subida de imágenes desde el admin panel no funcionará, pero el resto de la app sí.

### 2.4 Email (Nodemailer)

Para que las confirmaciones de pedido y formularios de contacto envíen emails reales:

1. Usar una **Contraseña de Aplicación** de Gmail:
   - Ir a https://myaccount.google.com/apppasswords
   - Generar contraseña para "Correo" → "Otro (nombre personalizado)"

```env
EMAIL_SERVICE=gmail
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
CONTACT_EMAIL=correo-donde-recibiras@gmail.com
```

> **Sin Email configurado:** El sistema usa Ethereal (servicio de testing) automáticamente y muestra un link en la consola para ver el email enviado.

### 2.5 Culqi (Pagos — Solo para Peru site)

1. Crear cuenta en: https://culqi.com/
2. Ir a "Desarrollo" → "API Keys"
3. Copiar claves de test:

```env
CULQI_PUBLIC_KEY=pk_test_xxxxxx
CULQI_SECRET_KEY=sk_test_xxxxxx
CULQI_RSA_ID=tu_rsa_id
CULQI_RSA_PUBLIC_KEY=tu_rsa_public_key
```

> **Sin Culqi:** El checkout con tarjeta/Yape no procesará pagos reales, pero el resto del carrito y WhatsApp checkout funcionan.

### 2.6 Google OAuth (Opcional)

1. Ir a https://console.cloud.google.com/
2. Crear un proyecto → APIs & Services → Credentials
3. Crear OAuth 2.0 Client ID

```env
GOOGLE_CLIENT_ID=tu_google_client_id
```

### 2.7 URLs del Sitio

```env
SITE_URL=https://www.agenciavectore.com
PERU_SITE_URL=https://pe.agenciavectore.com
FRONTEND_URL=http://localhost:5500
```

---

## 3. Poblar la Base de Datos

```bash
npm run seed
```

Esto crea:
- **1 usuario administrador** (email y password del `.env`)
- **28 productos** de ejemplo en 7 categorías (diseño, impresión, packaging, señalización, vinilos, digital, espacios)

---

## 4. Iniciar el Servidor

### Modo Desarrollo (con auto-reload)
```bash
npm run dev
```

### Modo Producción
```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

---

## 5. Acceder a las Diferentes Vistas

| URL | Vista |
|-----|-------|
| `http://localhost:3000/` | Global site (EN) — landing premium |
| `http://localhost:3000/?_site=pe` | Peru site (ES) — catálogo + tienda |
| `http://localhost:3000/admin.html` | Panel de administración |
| `http://localhost:3000/software` | Página de Vectore Flow |
| `http://localhost:3000/checkout` | Checkout (requiere `?_site=pe`) |
| `http://localhost:3000/api/health` | Health check de la API |

> **Nota:** En desarrollo local, el parámetro `?_site=pe` simula el subdominio `pe.agenciavectore.com`.

---

## 6. Verificar que Funciona

Abre en el navegador: `http://localhost:3000/api/health`

Deberías ver:
```json
{
  "status": "OK",
  "message": "Vectore API is running",
  "timestamp": "2026-04-21T..."
}
```

---

## 7. Usar el Admin Panel

1. Ir a `http://localhost:3000/admin.html`
2. Iniciar sesión con las credenciales del seed:
   - **Email:** `admin@vectore.com` (o tu `ADMIN_EMAIL`)
   - **Password:** `Admin123!` (o tu `ADMIN_PASSWORD`)
3. Desde aquí puedes gestionar:
   - Productos del catálogo
   - Proyectos del portafolio
   - Testimonios de clientes
   - Eventos/Sorteos
   - Leads/Briefs del formulario de contacto
   - Pedidos y estadísticas de pago
   - Notificaciones push
   - Assets del software (Vectore Flow)

---

## 🧪 Probar la API

### Con el navegador (GET)
- http://localhost:3000/api/products
- http://localhost:3000/api/products/featured/list
- http://localhost:3000/api/projects
- http://localhost:3000/api/testimonials

### Con el API Client incluido

```javascript
// En la consola del navegador (Peru site carga api-client.js):
const result = await api.login('admin@vectore.com', 'Admin123!');
const products = await api.getProducts({ category: 'digital' });
```

### Con Postman / Thunder Client

1. `baseURL = http://localhost:3000/api`
2. Para rutas protegidas, agregar header:
   ```
   Authorization: Bearer <token_del_login>
   ```

---

## 🔧 Troubleshooting

### "Cannot connect to MongoDB"
- Verificar que MongoDB esté corriendo
- Verificar la URI en `.env`
- Si usas Atlas, verificar que tu IP esté en la whitelist

### "npm is not recognized" / "npm no se reconoce"
- Instalar Node.js desde: https://nodejs.org/
- Reiniciar la terminal después de instalar

### "Execution of scripts is disabled" (PowerShell)
- Usar `cmd /c npm ...` en lugar de `npm ...`
- O ejecutar: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Puerto 3000 en uso
- Cambiar en `.env`: `PORT=3001`
- O cerrar la aplicación que usa el puerto 3000

### Error de CORS en el frontend
- Verificar que `FRONTEND_URL` en `.env` coincida con tu URL del frontend
- Default: `http://localhost:5500` (Live Server) o `http://localhost:3000` (Express)

### Imágenes no cargan en admin
- Verificar que las credenciales de Cloudinary estén configuradas en `.env`
- Los uploads requieren autenticación (admin login)

### Emails no se envían
- Sin `EMAIL_USER` configurado, el sistema usa Ethereal automáticamente
- Los links de preview aparecen en la consola del servidor

---

## 📚 Recursos

- [Express.js](https://expressjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Mongoose ODM](https://mongoosejs.com/)
- [Cloudinary](https://cloudinary.com/documentation)
- [Culqi API](https://docs.culqi.com/)
- [Nodemailer](https://nodemailer.com/)
- [Spline 3D](https://spline.design/)
- [JWT.io](https://jwt.io/)
