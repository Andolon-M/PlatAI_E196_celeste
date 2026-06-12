import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { serializeBigInt } from '../../../../shared/infrastructure/utils/bigint.utils';

export class DashboardController {
  /**
   * Obtiene el resumen del dashboard con totales y historial de movimientos
   */
  static async getSummary(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);

      const filters: { fecha_inicio?: Date; fecha_fin?: Date } = {};

      if (req.query.fecha_inicio) {
        filters.fecha_inicio = new Date(req.query.fecha_inicio as string);
      }
      if (req.query.fecha_fin) {
        filters.fecha_fin = new Date(req.query.fecha_fin as string);
      }

      const dashboard = await DashboardService.getDashboardSummary(userId, filters);

      return res.status(200).json({
        status: 200,
        message: 'Dashboard obtenido correctamente',
        data: serializeBigInt(dashboard)
      });
    } catch (error) {
      console.error('Error en getSummary controller:', error);
      return res.status(500).json({
        status: 500,
        message: 'Error al obtener el dashboard',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}
