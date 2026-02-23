import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../domain/auth';

/**
 * Genera un hash para una contraseña
 * @param {string} password - Contraseña a hashear
 * @returns {string} - Hash generado
 */
export const hashPassword = (password: string): string => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};

/**
 * Compara una contraseña con un hash para verificar coincidencia
 * @param {string} password - Contraseña a verificar
 * @param {string} hash - Hash almacenado
 * @returns {boolean} - True si coinciden, False si no
 */
export const comparePassword = (password: string, hash: string): boolean => {
    return bcrypt.compareSync(password, hash);
};

/**
 * Genera un token JWT para un usuario
 * @param {User} user - Usuario para el que se genera el token
 * @returns {string} - Token JWT generado
 */
export const generateToken = (user: User): string => {
    const payload = {
        userId: user.id?.toString(),
        email: user.email,
        roleId: user.role_id?.toString()
    };

    // Usar una clave secreta desde variables de entorno
    const secret = process.env.JWT_SECRET || 'default_secret_change_this';
    
    // Generar el token sin expiración si es el rol IA (roleId = 0)
    if (user.role_id === BigInt(0)) {
        // Sin expiración para el rol IA
        return jwt.sign(payload, secret);
    }
    
    // Con expiración de 24 horas para usuarios normales
    return jwt.sign(payload, secret, { expiresIn: '24h' });
};

/**
 * Verifica y decodifica un token JWT
 * @param {string} token - Token JWT a verificar
 * @param {boolean} ignoreExpiration - Ignorar expiración del token (para rol IA)
 * @returns {any} - Payload decodificado o null si es inválido
 */
export const verifyToken = (token: string, ignoreExpiration: boolean = false): any => {
    try {
        const secret = process.env.JWT_SECRET || 'default_secret_change_this';
        const options: jwt.VerifyOptions = ignoreExpiration ? { ignoreExpiration: true } : {};
        return jwt.verify(token, secret, options);
    } catch (error) {
        console.error('Error verificando token:', error);
        return null;
    }
};

/**
 * Genera un token de recuperación de contraseña
 * @param {string} email - Email del usuario
 * @returns {string} - Token generado
 */
export const generateRecoveryToken = (email: string): string => {
    const payload = { email };
    const secret = process.env.JWT_RECOVERY_SECRET || process.env.JWT_SECRET || 'recovery_secret_change_this';
    return jwt.sign(payload, secret, { expiresIn: '1h' });
};

/**
 * Verifica un token de recuperación de contraseña
 * @param {string} token - Token a verificar
 * @returns {object} - Objeto con el email del usuario
 */
export const verifyRecoveryToken = (token: string): { email: string } => {
    try {
        const secret = process.env.JWT_RECOVERY_SECRET || process.env.JWT_SECRET || 'recovery_secret_change_this';
        const decoded = jwt.verify(token, secret) as { email: string };
        return { email: decoded.email };
    } catch (error) {
        throw new Error('Token inválido o expirado');
    }
};