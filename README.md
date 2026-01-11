# Plataforma de Cotizaciones de Servicios

Una plataforma completa para conectar clientes con proveedores de servicios profesionales en Perú.

## 🚀 Características

- **Autenticación Segura**: JWT con refresh tokens
- **Roles de Usuario**: Clientes y Proveedores
- **Solicitudes de Servicio**: Publica y gestiona solicitudes
- **Sistema de Propuestas**: Proveedores envían propuestas
- **Comparación de Propuestas**: Visualiza y compara ofertas
- **Pagos con Stripe**: Pagos seguros con comisión de plataforma
- **Chat en Tiempo Real**: Socket.io para comunicación
- **Notificaciones**: Sistema de notificaciones completo
- **Búsqueda de Proveedores**: Filtros por categoría, ubicación y rating

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Redux Toolkit para gestión de estado
- React Router v6
- TailwindCSS
- Socket.io Client
- Axios
- React Hook Form + Zod

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- Socket.io
- Stripe SDK
- Nodemailer

## 📦 Instalación

### Prerrequisitos
- Node.js 20+
- PostgreSQL (o cuenta de Supabase)
- Cuenta de Stripe (para pagos)

### Configuración del Backend

1. Navegar al directorio del backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Copiar el archivo de variables de entorno:
```bash
cp .env.example .env
```

4. Configurar las variables en `.env`:
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="tu-secret-key"
STRIPE_SECRET_KEY="sk_test_..."
```

5. Ejecutar migraciones:
```bash
npx prisma migrate dev
```

6. Ejecutar el seed (datos de prueba):
```bash
npm run seed
```

7. Iniciar el servidor:
```bash
npm run dev
```

### Configuración del Frontend

1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## 👥 Usuarios de Prueba

Tras ejecutar el seed, tendrás:

- **Cliente**: `cliente@demo.com` / `password123`
- **Proveedor**: `proveedor@demo.com` / `password123`

## 📁 Estructura del Proyecto

```
cotizaciones/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Modelo de datos
│   │   └── seed.ts          # Datos de prueba
│   ├── src/
│   │   ├── config/          # Configuraciones
│   │   ├── controllers/     # Controladores HTTP
│   │   ├── services/        # Lógica de negocio
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # Rutas API
│   │   └── utils/           # Utilidades
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas
│   │   ├── store/           # Redux store
│   │   ├── services/        # Servicios API
│   │   └── hooks/           # Custom hooks
│   └── package.json
└── README.md
```

## 🔧 Scripts Disponibles

### Backend
- `npm run dev`: Servidor en modo desarrollo
- `npm run build`: Compilar a JavaScript
- `npm start`: Iniciar producción
- `npm run prisma:generate`: Generar cliente Prisma
- `npm run prisma:migrate`: Migraciones de BD
- `npm run prisma:studio`: UI de Prisma

### Frontend
- `npm run dev`: Servidor de desarrollo
- `npm run build`: Build de producción
- `npm run preview`: Preview del build

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh-token` - Renovar token

### Usuarios
- `GET /api/users/me` - Perfil actual
- `PUT /api/users/me` - Actualizar perfil
- `GET /api/users/notifications` - Notificaciones

### Solicitudes
- `GET /api/requests` - Listar solicitudes
- `POST /api/requests` - Crear solicitud
- `GET /api/requests/:id` - Ver solicitud
- `GET /api/requests/my-requests` - Mis solicitudes

### Propuestas
- `POST /api/proposals` - Crear propuesta
- `GET /api/proposals/my-proposals` - Mis propuestas
- `POST /api/proposals/:id/accept` - Aceptar propuesta
- `POST /api/proposals/:id/reject` - Rechazar propuesta

### Proveedores
- `GET /api/providers/search` - Buscar proveedores
- `GET /api/providers/:id` - Ver perfil

### Chat
- `GET /api/chat/conversations` - Conversaciones
- `GET /api/chat/conversations/:id/messages` - Mensajes
- `POST /api/chat/conversations/:id/messages` - Enviar mensaje

### Pagos
- `POST /api/payments/create-intent` - Crear pago
- `POST /api/payments/webhook` - Webhook de Stripe
- `GET /api/payments/transactions` - Transacciones

## 🔐 Seguridad

- Autenticación JWT con tokens de acceso y refresh
- Rate limiting en todas las APIs
- Validación de datos con Zod
- Sanitización de inputs
- CORS configurado
- Helmet para headers seguros

## 📄 Licencia

MIT License
