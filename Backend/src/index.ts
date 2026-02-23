import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { generalLimiter, authLimiter, sensitiveApiLimiter, uploadLimiter } from "./config/rate-limit/rateLimit.config";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/docs/swagger.config";
import router from "./routes/router";
import passport from "./shared/infrastructure/middlewares/passport.middleware";
import { bigIntSerializationMiddleware } from "./shared/infrastructure/middlewares/bigint.middleware";
import { environment } from "./config/enviroment";
import { initializeSocketGateway } from "./shared/infrastructure/realtime/socket.gateway";


const app = express();
const PORT = Number(process.env.EXPRESS_PORT) || 3000;

// Parse EXPRESS_PRODUCTION as boolean
const isProduction = process.env.EXPRESS_PRODUCTION?.toLowerCase() === 'true';

// Configurar URLs base según el entorno
const baseApiUrl = environment.apiBaseUrl;
const baseUrl = environment.baseUrl;

// Función para obtener la URL base completa


console.log('Modo:', isProduction ? 'Producción' : 'Local');
console.log('URL base completa:', baseApiUrl);

// Lista de orígenes permitidos
const allowedOrigins = [
  baseApiUrl,
  baseUrl,
  'http://localhost:3000',
  'http://localhost:3001', // Puerto común de Vite
].filter(Boolean);

console.log('Orígenes permitidos:', allowedOrigins);

// Configuración de CORS
const corsOptions = {
  origin: function(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    if (!origin) return callback(null, true);
    
    if (!isProduction) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization', 'x-timezone-offset', 'Access-Control-Allow-Credentials'],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'Access-Control-Allow-Credentials'],
  maxAge: 86400
};

// Middlewares globales
app.use(cors(corsOptions));
app.use(express.json());

// Middleware para serializar BigInt automáticamente en respuestas JSON
app.use(bigIntSerializationMiddleware);

// Configurar helmet para el resto de la aplicación - Modificado para permitir cookies en Safari
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'unsafe-none' },
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));


// Inicializar Passport
app.use(passport.initialize());

// Manejar preflight OPTIONS para todas las rutas
app.options('*', cors(corsOptions));

// Ruta raíz: Swagger en desarrollo, health en producción
app.get('/', (req, res) => {
  if (isProduction) {
    res.redirect('/api/health');
  } else {
    res.redirect('/api-docs');
  }
});

// Swagger solo en no-producción
if (!isProduction) {
  // Servir el archivo CSS de Swagger UI
  app.get('/api-docs/swagger-ui.css', (req, res) => {
    const cssPath = require.resolve('swagger-ui-dist/swagger-ui.css');
    res.set('Content-Type', 'text/css');
    res.sendFile(cssPath);
  });

  // Servir los archivos JavaScript de Swagger UI
  app.get('/api-docs/swagger-ui-bundle.js', (req, res) => {
    const jsPath = require.resolve('swagger-ui-dist/swagger-ui-bundle.js');
    res.set('Content-Type', 'application/javascript');
    res.sendFile(jsPath);
  });

  app.get('/api-docs/swagger-ui-standalone-preset.js', (req, res) => {
    const jsPath = require.resolve('swagger-ui-dist/swagger-ui-standalone-preset.js');
    res.set('Content-Type', 'application/javascript');
    res.sendFile(jsPath);
  });

  // Documentación Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar',
    customSiteTitle: "API SIGA myApp",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      deepLinking: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      docExpansion: 'none',
      tryItOutEnabled: true,
      withCredentials: true
    },
  }));

  // Endpoint para obtener la especificación Swagger en formato JSON
  app.get('/api/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

// ⚡ Rate Limiting Configuration
const isRateLimitEnabled = process.env.ENABLE_RATE_LIMIT?.toLowerCase() !== 'false'; // Habilitado por defecto

// Health check endpoint (sin rate limiting)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: isProduction ? 'production' : 'development',
    rateLimiting: isRateLimitEnabled
  });
});

console.log('Rate Limiting:', isRateLimitEnabled ? 'Habilitado' : 'Deshabilitado');

if (isRateLimitEnabled) {
  console.log('🛡️  Aplicando Rate Limiting...');
  
  // Rate limiting específico para uploads (más restrictivo)
  app.use("/api/upload", uploadLimiter);
  app.use("/api/delete-image", uploadLimiter);
  
  // Rate limiting para autenticación (preventivo contra fuerza bruta)
  app.use("/api/auth", authLimiter);
  
  // Rate limiting para rutas sensibles (administración)
  app.use("/api/userManagement", sensitiveApiLimiter);
  app.use("/api/tournament", sensitiveApiLimiter);
  app.use("/api/fault", sensitiveApiLimiter);
  
  // Rate limiting general para todas las demás rutas (debe ir al final)
  app.use("/api", generalLimiter);
    console.log('✅ Rate Limiting configurado correctamente');
} else {
  console.log('⚠️  Rate Limiting DESHABILITADO');
}

// Rutas de la API
app.use("/api", router);

// Middleware de error personalizado para CORS
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.message.includes('CORS')) {
    console.error('Error CORS:', err.message);
    return res.status(403).json({
      error: 'CORS no permitido',
      message: err.message,
      origin: req.headers.origin,
      allowedOrigins: allowedOrigins
    });
  }
  next(err);
});



const server = createServer(app);
initializeSocketGateway(server, allowedOrigins, {
  path: isProduction ? '/api/socket.io' : undefined
});

// Iniciar servidor HTTP + Socket.IO
server.listen(PORT, () => {
  console.log(`\n🔥 Servidor corriendo en ${baseApiUrl}`);
  if (!isProduction) {
    console.log(`📚 Documentación Swagger disponible en ${baseApiUrl}/api-docs`);
    console.log(`🔧 Prisma Studio disponible en http://localhost:5555`);
  }
  console.log(`🌍 Modo: ${isProduction ? 'Producción' : 'Local'}`);
  
  // Inicializar roles y permisos
  // seedRolesAndPermissions()
  //   .then(() => console.log('Roles y permisos inicializados correctamente'))
  //   .catch(err => console.error('Error al inicializar roles y permisos:', err));
});

