# Guía de Configuración del Backend - Vectore Agency

## 📋 Pasos de Configuración

### 1. Instalar MongoDB

#### Opción A: MongoDB Local (Windows)

1. Descargar MongoDB Community Server desde: https://www.mongodb.com/try/download/community
2. Instalar MongoDB siguiendo el asistente
3. MongoDB se ejecutará automáticamente como servicio de Windows
4. Verificar que esté corriendo:
```bash
cmd /c mongod --version
```

#### Opción B: MongoDB Atlas (Cloud - Recomendado)

1. Crear cuenta gratuita en: https://www.mongodb.com/cloud/atlas/register
2. Crear un nuevo cluster (Free Tier M0)
3. Configurar acceso:
   - Database Access: Crear un usuario con contraseña
   - Network Access: Agregar tu IP o permitir acceso desde cualquier lugar (0.0.0.0/0)
4. Obtener la URI de conexión:
   - Click en "Connect" en tu cluster
   - Seleccionar "Connect your application"
   - Copiar la URI (ejemplo: `mongodb+srv://usuario:password@cluster.mongodb.net/vectore-agency`)
5. Actualizar `.env` con tu URI:
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/vectore-agency
```

### 2. Configurar Stripe (Pagos con Tarjeta)

1. Crear cuenta en: https://dashboard.stripe.com/register
2. Ir a "Developers" > "API keys"
3. Copiar las claves de test:
   - Secret key (sk_test_...)
   - Publishable key (pk_test_...)
4. Actualizar `.env`:
```env
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica
```

### 3. Configurar PayPal (Opcional)

1. Crear cuenta de desarrollador: https://developer.paypal.com/
2. Ir a "Dashboard" > "My Apps & Credentials"
3. Crear una nueva app en modo Sandbox
4. Copiar Client ID y Secret
5. Actualizar `.env`:
```env
PAYPAL_CLIENT_ID=tu_client_id
PAYPAL_CLIENT_SECRET=tu_client_secret
PAYPAL_MODE=sandbox
```

### 4. Configurar OpenAI (Opcional - Para Cotizaciones con IA)

1. Crear cuenta en: https://platform.openai.com/signup
2. Ir a "API keys" y crear una nueva clave
3. Actualizar `.env`:
```env
OPENAI_API_KEY=sk-tu_clave_de_openai
```

**Nota:** Si no configuras OpenAI, el sistema funcionará normalmente pero no generará sugerencias automáticas en las cotizaciones.

### 5. Configurar JWT Secret

Generar una clave secreta segura para JWT:

```bash
# En PowerShell
cmd /c node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Actualizar `.env`:
```env
JWT_SECRET=tu_clave_generada_aqui
```

## 🚀 Iniciar el Backend

### 1. Poblar la Base de Datos (Primera vez)

```bash
cmd /c npm run seed
```

Esto creará:
- Usuario administrador (admin@vectore.com / Admin123!)
- 6 productos de ejemplo

### 2. Iniciar el Servidor

**Modo Desarrollo (con auto-reload):**
```bash
cmd /c npm run dev
```

**Modo Producción:**
```bash
cmd /c npm start
```

El servidor estará disponible en: `http://localhost:3000`

### 3. Verificar que Funciona

Abrir en el navegador: `http://localhost:3000/api/health`

Deberías ver:
```json
{
  "status": "OK",
  "message": "Vectore API is running",
  "timestamp": "2026-01-06T..."
}
```

## 🔗 Conectar Frontend con Backend

### Opción 1: Usar el Cliente API Incluido

Agregar al HTML antes de tus scripts:
```html
<script src="api-client.js"></script>
```

Usar en tu código:
```javascript
// Login
const result = await api.login('admin@vectore.com', 'Admin123!');

// Obtener productos
const products = await api.getProducts({ category: 'digital' });

// Crear orden
const order = await api.createOrder({
  customer: { name: 'Juan', email: 'juan@example.com', phone: '123456' },
  items: [{ productId: '...', quantity: 1 }],
  paymentMethod: 'stripe'
});
```

### Opción 2: Fetch Directo

```javascript
// Ejemplo de login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'admin@vectore.com', 
    password: 'Admin123!' 
  })
});
const data = await response.json();
const token = data.token;

// Usar token en peticiones autenticadas
const productsResponse = await fetch('http://localhost:3000/api/products', {
  headers: { 
    'Authorization': `Bearer ${token}` 
  }
});
```

## 🧪 Probar la API

### Usando el Navegador

Endpoints GET se pueden probar directamente:
- http://localhost:3000/api/products
- http://localhost:3000/api/products/featured/list

### Usando Postman o Thunder Client

1. Importar la colección de endpoints
2. Configurar variable de entorno: `baseURL = http://localhost:3000/api`
3. Para rutas protegidas, agregar header:
   - Key: `Authorization`
   - Value: `Bearer <tu_token>`

## 📝 Ejemplos de Uso

### Crear un Producto (Admin)

```javascript
// 1. Login como admin
const loginData = await api.login('admin@vectore.com', 'Admin123!');

// 2. Crear producto
const product = await api.createProduct({
  name: 'Nuevo Servicio',
  description: 'Descripción del servicio',
  category: 'digital',
  subcategory: 'Marketing',
  price: 299,
  images: [
    { url: '/images/servicio.jpg', alt: 'Servicio', isPrimary: true }
  ],
  features: ['Feature 1', 'Feature 2'],
  stock: 999,
  isAvailable: true,
  tags: ['marketing', 'digital']
});
```

### Procesar un Pago con Stripe

```javascript
// 1. Crear orden
const order = await api.createOrder({
  customer: {
    name: 'Cliente Test',
    email: 'cliente@test.com',
    phone: '1234567890'
  },
  items: [
    { productId: 'ID_DEL_PRODUCTO', quantity: 1 }
  ],
  paymentMethod: 'stripe'
});

// 2. Obtener client secret para Stripe
const payment = await api.createStripePayment(order.data._id);

// 3. Usar Stripe.js en el frontend para procesar el pago
// (Ver documentación de Stripe Elements)

// 4. Confirmar pago
await api.confirmPayment(order.data._id, 'transaction_id', {
  method: 'stripe'
});
```

### Crear Cotización con IA

```javascript
const quotation = await api.createQuotation({
  customer: {
    name: 'Empresa XYZ',
    email: 'contacto@xyz.com',
    phone: '9876543210',
    company: 'XYZ Corp'
  },
  projectType: 'branding',
  description: 'Necesitamos un rebranding completo de nuestra empresa',
  requirements: [
    'Nuevo logo',
    'Paleta de colores',
    'Manual de marca'
  ],
  budget: {
    min: 500,
    max: 1500
  }
});

// La respuesta incluirá sugerencias generadas por IA en quotation.data.aiSuggestions
```

## 🔧 Troubleshooting

### Error: "Cannot connect to MongoDB"
- Verificar que MongoDB esté corriendo
- Verificar la URI en `.env`
- Si usas Atlas, verificar que tu IP esté en la whitelist

### Error: "npm no se reconoce"
- Instalar Node.js desde: https://nodejs.org/
- Reiniciar la terminal después de instalar

### Error: "Execution of scripts is disabled"
- Usar `cmd /c npm ...` en lugar de `npm ...`
- O ejecutar: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Puerto 3000 en uso
- Cambiar el puerto en `.env`: `PORT=3001`
- O cerrar la aplicación que usa el puerto 3000

### Error de CORS en el frontend
- Verificar que `FRONTEND_URL` en `.env` coincida con tu URL del frontend
- Por defecto: `http://localhost:5500` (Live Server)

## 📚 Recursos Adicionales

- [Documentación de Express](https://expressjs.com/)
- [Documentación de MongoDB](https://docs.mongodb.com/)
- [Documentación de Stripe](https://stripe.com/docs)
- [Documentación de OpenAI](https://platform.openai.com/docs)
- [JWT.io](https://jwt.io/) - Para decodificar tokens

## 🆘 Soporte

Si encuentras problemas:
1. Revisar los logs del servidor en la consola
2. Verificar que todas las variables de entorno estén configuradas
3. Asegurarte de que MongoDB esté corriendo
4. Verificar que las credenciales de las APIs sean correctas
