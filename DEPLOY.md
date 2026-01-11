# 🚀 GUÍA DE DEPLOY - PLATAFORMA DE COTIZACIONES

## ✅ Estado del Proyecto

| Módulo | Estado | Notas |
|--------|--------|-------|
| Autenticación | ✅ Funcional | JWT con refresh tokens |
| Usuarios/Perfiles | ✅ Funcional | CLIENT y PROVIDER |
| Solicitudes | ✅ Funcional | CRUD completo |
| Propuestas | ✅ Funcional | Envío, aceptación, rechazo |
| Proveedores | ✅ Funcional | Búsqueda, perfil, portafolio |
| Chat | ✅ Funcional | Socket.io en tiempo real |
| Notificaciones | ✅ Funcional | Panel y contador |
| Transacciones | ⚠️ Parcial | API lista, pendiente frontend |
| Pagos | ⚠️ Parcial | Stripe configurado, sin webhook |
| Dashboard | ✅ Funcional | Stats reales desde API |

---

## 📋 REQUISITOS PREVIOS

1. **Node.js 20+** instalado
2. **Cuenta de Supabase** con proyecto creado
3. **Cuenta de Stripe** (para pagos, opcional)
4. **Cuenta de SendGrid** (para emails, opcional)

---

## 🔧 CONFIGURACIÓN PARA PRODUCCIÓN

### 1. Base de datos (Supabase)

1. Ve a tu proyecto Supabase: **https://izrycxaschxrinzaucvj.supabase.co**
2. Settings → Database → Connection string
3. Copia la URL y pégala en `DATABASE_URL`

### 2. Generar claves JWT seguras

Ejecuta en PowerShell:
```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Min 0 -Max 255 }))
```

Copia las dos claves generadas y pégalas en:
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

### 3. Stripe (Opcional)

1. Regístrate en https://stripe.com
2. Obtén tus claves de test de Dashboard → Developers → API keys
3. Configura el webhook en el dashboard de Stripe

### 4. Variables de entorno

Copia el archivo de producción:
```bash
cp backend/.env.production backend/.env
```

Edita `backend/.env` con tus valores reales.

---

## 🏗️ BUILD PARA PRODUCCIÓN

### Backend

```bash
cd backend
npm install
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run build
```

El build se generará en `frontend/dist/`

---

## 🚀 OPCIONES DE DEPLOY

### Opción 1: Vercel + Railway (Recomendado)

**Frontend (Vercel):**
1. Conecta tu repositorio a Vercel
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment variables:
   - `VITE_API_URL`: URL del backend

**Backend (Railway):**
1. Conecta tu repositorio a Railway
2. Configure variables de entorno en Railway dashboard
3. Deploy会自动启动

### Opción 2: Render.com

1. Crea un Web Service para el backend
2. Crea un Static Site para el frontend
3. Configura las variables de entorno

### Opción 3: VPS (DigitalOcean, Linode, etc.)

```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clonar y configurar
git clone [TU_REPO]
cd Cotizaciones-para-Servicios

# Backend
cd backend
npm install
npm run build
npm start

# Frontend (en otro terminal o con PM2)
cd frontend
npm install
npm run build
# Configurar Nginx para servir el frontend y proxy al backend
```

---

## 🧪 VERIFICACIÓN PRE-PRODUCCIÓN

### 1. Probar login/register
```bash
# Crear usuario de prueba via API
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","role":"CLIENT"}'
```

### 2. Probar endpoints
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nuevo@demo.com","password":"password123"}'

# Obtener perfil (con token)
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer [TU_TOKEN]"
```

### 3. Verificar base de datos
En Supabase → SQL Editor:
```sql
SELECT COUNT(*) as users FROM users;
SELECT COUNT(*) as requests FROM requests;
SELECT COUNT(*) as proposals FROM request_proposals;
```

---

## 📊 ENDPOINTS DISPONIBLES

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh-token` - Renovar token
- `POST /api/auth/forgot-password` - Recuperar password

### Usuarios
- `GET /api/users/me` - Perfil actual
- `PUT /api/users/me` - Actualizar perfil
- `GET /api/users/notifications` - Notificaciones

### Solicitudes
- `GET /api/requests` - Listar solicitudes
- `POST /api/requests` - Crear solicitud
- `GET /api/requests/:id` - Ver solicitud
- `PUT /api/requests/:id` - Actualizar solicitud
- `DELETE /api/requests/:id` - Eliminar solicitud

### Propuestas
- `POST /api/proposals` - Crear propuesta
- `GET /api/proposals/my-proposals` - Mis propuestas
- `POST /api/proposals/:id/accept` - Aceptar propuesta
- `POST /api/proposals/:id/reject` - Rechazar propuesta

### Proveedores
- `GET /api/providers/search` - Buscar proveedores
- `GET /api/providers/:id` - Perfil de proveedor

### Chat
- `GET /api/chat/conversations` - Conversaciones
- `GET /api/chat/conversations/:id/messages` - Mensajes
- `POST /api/chat/conversations/:id/messages` - Enviar mensaje

### Pagos
- `POST /api/payments/create-intent` - Crear pago
- `POST /api/payments/webhook` - Webhook de Stripe
- `GET /api/payments/transactions` - Transacciones

---

## 🔒 SEGURIDAD

- ✅ JWT con tokens de acceso y refresh
- ✅ Rate limiting en APIs
- ✅ Validación de datos con Zod
- ✅ Hash de passwords con bcrypt
- ⚠️ RLS en Supabase (configurar desde panel)
- ⚠️ HTTPS obligatorio en producción

---

## 📝 NOTAS FINALES

1. **Primero limpia el localStorage** del navegador antes de probar en producción
2. **Los usuarios de prueba** son:
   - `nuevo@demo.com` / `password123` (CLIENTE)
   - `proveedor@demo.com` / `password123` (PROVEEDOR)
3. **El chat y notificaciones** requieren que el backend esté corriendo
4. **Los pagos** funcionan en modo test de Stripe

---

## ❓ SOPORTE

Si tienes problemas:

1. Revisa los logs del backend
2. Verifica la conexión a Supabase
3. Confirma que las variables de entorno están correctas
4. Revisa la consola del navegador (F12)
