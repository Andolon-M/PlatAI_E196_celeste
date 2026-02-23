import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * @swagger
 * tags:
 *   name: Rate Middleware
 *   description: Middlewares de limitación de solicitudes (Rate Limiting).
 */

/**
 * @swagger
 * /api/general:
 *   get:
 *     tags:
 *       - Rate Middleware
 *     summary: Endpoint protegido con limitador general
 *     description: Este endpoint está protegido con `generalLimiter` para evitar abusos.
 *     security:
 *       - RateLimiting: []
 *     responses:
 *       200:
 *         description: Respuesta exitosa
 *       429:
 *         description: Se ha excedido el límite de solicitudes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RateLimitExceeded"
 */

/**
 * @swagger
 * /api/auth:
 *   post:
 *     tags:
 *       - Rate Middleware
 *     summary: Endpoint protegido con limitador de autenticación
 *     description: Este endpoint limita los intentos de autenticación a `3` cada `30 segundos`.
 *     security:
 *       - RateLimiting: []
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       429:
 *         description: Se han excedido los intentos de inicio de sesión
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RateLimitExceeded"
 */

/**
 * @swagger
 * /api/sensitive:
 *   get:
 *     tags:
 *       - Rate Middleware
 *     summary: Endpoint protegido con limitador de API sensible
 *     description: Restringe solicitudes a `30` por minuto para endpoints críticos.
 *     security:
 *       - RateLimiting: []
 *     responses:
 *       200:
 *         description: Respuesta exitosa
 *       429:
 *         description: Se ha excedido el límite de solicitudes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RateLimitExceeded"
 */


// Extender la interfaz Request para incluir rateLimit
declare module 'express' {
    interface Request {
        rateLimit?: {
            remaining: number;
            resetTime: number;
        };
    }
}

// Función para extraer la IP real del cliente
const extractRealIP = (req: Request): string => {
    // Lista de headers para obtener la IP real (en orden de prioridad)
    const ipHeaders = [
        'cf-connecting-ip',        // Cloudflare
        'x-real-ip',              // Nginx proxy
        'x-forwarded-for',        // Proxy estándar
        'x-client-ip',            // Apache mod_proxy
        'x-cluster-client-ip',    // Cluster
        'x-forwarded',            // Proxy alternativo
        'forwarded-for',          // RFC 7239
        'forwarded'               // RFC 7239
    ];

    // Intentar obtener IP de headers personalizados
    for (const header of ipHeaders) {
        const headerValue = req.headers[header] as string;
        if (headerValue) {
            // Si hay múltiples IPs (separadas por coma), tomar la primera
            const ip = headerValue.split(',')[0].trim();
            if (ip && ip !== 'unknown') {
                return ip;
            }
        }
    }

    // Fallback a connection.remoteAddress o socket.remoteAddress
    return req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           (req.connection as any)?.socket?.remoteAddress || 
           req.ip || 
           'unknown';
};

// Función auxiliar para formatear el tiempo restante en minutos o segundos
const formatTime = (seconds: number): string => {
    if (seconds >= 60) {
        const minutes = Math.ceil(seconds / 60);
        return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    }
    return `${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}`;
};

/**
 * Middleware de rate limiting para todas las rutas generales.
 * Límite predeterminado: 100 solicitudes cada 15 minutos.
 */
export const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.GENERAL_RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
    max: parseInt(process.env.GENERAL_RATE_LIMIT_MAX || '100'), // 100 peticiones (más generoso)
    keyGenerator: extractRealIP, // Usar función personalizada para extraer IP
    message: 'Demasiadas peticiones desde esta IP, por favor intente nuevamente en 15 minutos',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        const realIP = extractRealIP(req);
        const windowMs = parseInt(process.env.GENERAL_RATE_LIMIT_WINDOW_MS || '900000');
        const remainingSeconds = Math.ceil(windowMs / 1000);
        
        console.log(`🚫 Rate limit exceeded - IP: ${realIP}, Route: ${req.path}`);
        
        res.status(429).json({
            error: 'Demasiadas peticiones',
            message: `Límite de peticiones excedido desde esta IP. Intente nuevamente en ${formatTime(remainingSeconds)}`,
            remainingTime: remainingSeconds,
            ip: realIP
        });
    }
});

/**
 * Middleware de rate limiting para autenticación.
 * Límite predeterminado: 5 intentos cada 60 segundos.
 */
export const authLimiter = rateLimit({
    windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '60000'), // 60 segundos
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5'), // 5 intentos (más generoso)
    keyGenerator: extractRealIP, // Usar función personalizada para extraer IP
    message: 'Demasiados intentos de inicio de sesión, por favor intente nuevamente en 60 segundos',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        const realIP = extractRealIP(req);
        const windowMs = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '60000');
        const remainingSeconds = Math.ceil(windowMs / 1000);
        
        console.log(`🔐 Auth rate limit exceeded - IP: ${realIP}, Route: ${req.path}`);
        
        res.status(429).json({
            error: 'Demasiados intentos de inicio de sesión',
            message: `Por favor, intente nuevamente en ${formatTime(remainingSeconds)}`,
            remainingTime: remainingSeconds,
            ip: realIP
        });
    }
});

/**
 * Middleware de rate limiting para rutas de API sensibles.
 * Límite predeterminado: 50 solicitudes cada 1 minuto.
 */
export const sensitiveApiLimiter = rateLimit({
    windowMs: parseInt(process.env.SENSITIVE_RATE_LIMIT_WINDOW_MS || '60000'), // 1 minuto
    max: parseInt(process.env.SENSITIVE_RATE_LIMIT_MAX || '50'), // 50 peticiones (más generoso)
    keyGenerator: extractRealIP, // Usar función personalizada para extraer IP
    message: 'Demasiadas peticiones a la API, por favor intente nuevamente en un minuto',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        const realIP = extractRealIP(req);
        const windowMs = parseInt(process.env.SENSITIVE_RATE_LIMIT_WINDOW_MS || '60000');
        const remainingSeconds = Math.ceil(windowMs / 1000);
        
        console.log(`⚠️ Sensitive API rate limit exceeded - IP: ${realIP}, Route: ${req.path}`);
        
        res.status(429).json({
            error: 'Demasiadas peticiones a la API sensible',
            message: `Límite de peticiones excedido a endpoints críticos. Intente nuevamente en ${formatTime(remainingSeconds)}`,
            remainingTime: remainingSeconds,
            ip: realIP
        });
    }
});

/**
 * Middleware de rate limiting específico para uploads de archivos.
 * Límite predeterminado: 20 uploads cada 10 minutos.
 */
export const uploadLimiter = rateLimit({
    windowMs: parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS || '600000'), // 10 minutos
    max: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX || '20'), // 20 uploads
    keyGenerator: extractRealIP,
    message: 'Demasiados uploads desde esta IP, por favor intente nuevamente en 10 minutos',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        const realIP = extractRealIP(req);
        const windowMs = parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS || '600000');
        const remainingSeconds = Math.ceil(windowMs / 1000);
        
        console.log(`📤 Upload rate limit exceeded - IP: ${realIP}, Route: ${req.path}`);
        
        res.status(429).json({
            error: 'Demasiados uploads',
            message: `Límite de uploads excedido. Intente nuevamente en ${formatTime(remainingSeconds)}`,
            remainingTime: remainingSeconds,
            ip: realIP
        });
    }
});
