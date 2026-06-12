import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../../config/database/db';

export const isIaAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    const expectedKey = process.env.IA_API_KEY;

    if (!apiKey || apiKey !== expectedKey) {
      return res.status(401).json({
        status: 401,
        message: 'No autorizado. API Key de IA inválida o faltante.',
      });
    }

    const celular = req.body.celular || req.query.celular;

    if (!celular) {
      return res.status(400).json({
        status: 400,
        message: 'El número de celular es requerido para identificar al usuario.',
      });
    }

    // Buscar al usuario por celular
    const user = await prisma.users.findUnique({
      where: { celular: String(celular) },
      select: { id: true, estado: true }
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'Usuario no encontrado. Por favor registrese en la plataforma.',
      });
    }

    if (user.estado !== 1) {
      return res.status(403).json({
        status: 403,
        message: 'La cuenta de usuario está inactiva.',
      });
    }

    // Inyectar el userId en el request para que lo usen los controladores
    req.user = { 
      userId: user.id.toString(), 
      name: 'IA Agent', 
      email: 'ia@system',
      subscription: null,
      capabilities: []
    };

    next();
  } catch (error) {
    console.error('Error en middleware de IA:', error);
    return res.status(500).json({
      status: 500,
      message: 'Error interno del servidor en la autenticación de IA.',
    });
  }
};
