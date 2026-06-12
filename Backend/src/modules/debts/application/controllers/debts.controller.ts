import { Request, Response } from 'express';
import { DebtsService } from '../services/debts.service';
import { serializeBigInt } from '../../../../shared/infrastructure/utils/bigint.utils';
import { TipoDeuda, EstadoDeuda } from '@prisma/client';

export class DebtsController {
  /**
   * Obtiene todas las deudas/préstamos del usuario
   */
  static async getDebts(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const tipo = req.query.tipo as TipoDeuda | undefined;
      const estado = req.query.estado as EstadoDeuda | undefined;

      const debts = await DebtsService.getDebts(userId, { tipo, estado });

      return res.status(200).json({
        status: 200,
        message: 'Deudas y préstamos obtenidos correctamente',
        data: serializeBigInt(debts)
      });
    } catch (error) {
      console.error('Error en getDebts controller:', error);
      return res.status(500).json({
        status: 500,
        message: 'Error al obtener las deudas y préstamos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene una deuda por su ID
   */
  static async getDebtById(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const id = BigInt(req.params.id);

      const debt = await DebtsService.getDebtById(id, userId);

      return res.status(200).json({
        status: 200,
        message: 'Deuda o préstamo obtenido correctamente',
        data: serializeBigInt(debt)
      });
    } catch (error) {
      console.error('Error en getDebtById controller:', error);
      const isNotFound = error instanceof Error && error.message.includes('no encontrado');
      return res.status(isNotFound ? 404 : 500).json({
        status: isNotFound ? 404 : 500,
        message: 'Error al obtener la deuda o préstamo',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Crea una nueva deuda/préstamo
   */
  static async createDebt(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const data = {
        tipo: req.body.tipo as TipoDeuda,
        persona_entidad: req.body.persona_entidad,
        monto_total: Number(req.body.monto_total),
        descripcion: req.body.descripcion,
        fecha_vencimiento: req.body.fecha_vencimiento ? new Date(req.body.fecha_vencimiento) : undefined
      };

      const debt = await DebtsService.createDebt(userId, data);

      return res.status(201).json({
        status: 201,
        message: 'Deuda o préstamo creado exitosamente',
        data: serializeBigInt(debt)
      });
    } catch (error) {
      console.error('Error en createDebt controller:', error);
      return res.status(400).json({
        status: 400,
        message: 'Error al crear la deuda o préstamo',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Actualiza una deuda/préstamo
   */
  static async updateDebt(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const id = BigInt(req.params.id);
      const data = {
        ...(req.body.tipo ? { tipo: req.body.tipo as TipoDeuda } : {}),
        ...(req.body.persona_entidad ? { persona_entidad: req.body.persona_entidad } : {}),
        ...(req.body.monto_total !== undefined ? { monto_total: Number(req.body.monto_total) } : {}),
        ...(req.body.descripcion !== undefined ? { descripcion: req.body.descripcion } : {}),
        ...(req.body.fecha_vencimiento !== undefined
          ? { fecha_vencimiento: req.body.fecha_vencimiento ? new Date(req.body.fecha_vencimiento) : undefined }
          : {}),
        ...(req.body.estado ? { estado: req.body.estado as EstadoDeuda } : {})
      };

      const debt = await DebtsService.updateDebt(id, userId, data);

      return res.status(200).json({
        status: 200,
        message: 'Deuda o préstamo actualizado exitosamente',
        data: serializeBigInt(debt)
      });
    } catch (error) {
      console.error('Error en updateDebt controller:', error);
      const isNotFound = error instanceof Error && error.message.includes('no encontrado');
      return res.status(isNotFound ? 404 : 400).json({
        status: isNotFound ? 404 : 400,
        message: 'Error al actualizar la deuda o préstamo',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Elimina una deuda/préstamo
   */
  static async deleteDebt(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const id = BigInt(req.params.id);

      const result = await DebtsService.deleteDebt(id, userId);

      return res.status(200).json({
        status: 200,
        message: result.message
      });
    } catch (error) {
      console.error('Error en deleteDebt controller:', error);
      const isNotFound = error instanceof Error && error.message.includes('no encontrado');
      const isConflict = error instanceof Error && error.message.includes('abono(s) registrado(s)');
      const statusCode = isNotFound ? 404 : isConflict ? 409 : 400;
      return res.status(statusCode).json({
        status: statusCode,
        message: 'Error al eliminar la deuda o préstamo',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Registra un abono a una deuda
   */
  static async createPayment(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const debtId = BigInt(req.params.id);
      const data = {
        monto_abonado: Number(req.body.monto_abonado),
        nota: req.body.nota,
        fecha_abono: new Date(req.body.fecha_abono)
      };

      const result = await DebtsService.createPayment(userId, debtId, data);

      return res.status(201).json({
        status: 201,
        message: 'Abono registrado exitosamente',
        data: serializeBigInt(result)
      });
    } catch (error) {
      console.error('Error en createPayment controller:', error);
      return res.status(400).json({
        status: 400,
        message: 'Error al registrar el abono',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene todos los abonos de una deuda
   */
  static async getPayments(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const debtId = BigInt(req.params.id);

      const payments = await DebtsService.getPayments(debtId, userId);

      return res.status(200).json({
        status: 200,
        message: 'Abonos obtenidos correctamente',
        data: serializeBigInt(payments)
      });
    } catch (error) {
      console.error('Error en getPayments controller:', error);
      const isNotFound = error instanceof Error && error.message.includes('no encontrado');
      return res.status(isNotFound ? 404 : 500).json({
        status: isNotFound ? 404 : 500,
        message: 'Error al obtener los abonos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Elimina/revierte un abono
   */
  static async deletePayment(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const paymentId = BigInt(req.params.paymentId);

      const result = await DebtsService.deletePayment(paymentId, userId);

      return res.status(200).json({
        status: 200,
        message: result.message
      });
    } catch (error) {
      console.error('Error en deletePayment controller:', error);
      return res.status(400).json({
        status: 400,
        message: 'Error al eliminar el abono',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}
