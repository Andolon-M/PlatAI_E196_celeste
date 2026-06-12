import { Request, Response } from 'express';
import { IAService } from '../services/ia.service';
import { serializeBigInt } from '../../../../shared/infrastructure/utils/bigint.utils';
import { TipoMovimiento } from '@prisma/client';

export class IAController {
  
  static async registerIncome(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const { monto, descripcion, id_categoria, id_cuenta, fecha, metodo_pago } = req.body;

      if (!monto || !descripcion) {
        return res.status(400).json({ status: 400, message: 'monto y descripcion son obligatorios' });
      }

      const result = await IAService.registerMovement(userId, {
        tipo: TipoMovimiento.ingreso,
        monto: Number(monto),
        descripcion: String(descripcion),
        id_categoria: id_categoria ? BigInt(id_categoria) : undefined,
        id_cuenta: id_cuenta ? BigInt(id_cuenta) : undefined,
        fecha: fecha ? new Date(fecha) : undefined,
        metodo_pago: metodo_pago
      });

      return res.status(201).json({
        status: 201,
        message: 'Ingreso registrado correctamente por IA',
        data: serializeBigInt(result)
      });
    } catch (error) {
      console.error('Error IA registerIncome:', error);
      return res.status(500).json({ status: 500, message: error instanceof Error ? error.message : 'Error interno' });
    }
  }

  static async registerExpense(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const { monto, descripcion, id_categoria, id_cuenta, fecha, metodo_pago } = req.body;

      if (!monto || !descripcion) {
        return res.status(400).json({ status: 400, message: 'monto y descripcion son obligatorios' });
      }

      const result = await IAService.registerMovement(userId, {
        tipo: TipoMovimiento.gasto,
        monto: Number(monto),
        descripcion: String(descripcion),
        id_categoria: id_categoria ? BigInt(id_categoria) : undefined,
        id_cuenta: id_cuenta ? BigInt(id_cuenta) : undefined,
        fecha: fecha ? new Date(fecha) : undefined,
        metodo_pago: metodo_pago
      });

      return res.status(201).json({
        status: 201,
        message: 'Gasto registrado correctamente por IA',
        data: serializeBigInt(result)
      });
    } catch (error) {
      console.error('Error IA registerExpense:', error);
      return res.status(500).json({ status: 500, message: error instanceof Error ? error.message : 'Error interno' });
    }
  }

  static async getCategories(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const tipo = req.query.tipo as 'ingreso' | 'gasto' | undefined;
      
      const categories = await IAService.getCategories(userId, tipo);
      return res.status(200).json({
        status: 200,
        message: 'Categorías consultadas por IA',
        data: serializeBigInt(categories)
      });
    } catch (error) {
      console.error('Error IA getCategories:', error);
      return res.status(500).json({ status: 500, message: error instanceof Error ? error.message : 'Error interno' });
    }
  }

  static async getDebtsStatus(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const debts = await IAService.getDebtsStatus(userId);
      
      return res.status(200).json({
        status: 200,
        message: 'Deudas consultadas por IA',
        data: serializeBigInt(debts)
      });
    } catch (error) {
      console.error('Error IA getDebtsStatus:', error);
      return res.status(500).json({ status: 500, message: error instanceof Error ? error.message : 'Error interno' });
    }
  }

  static async getUserInfo(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const user = await IAService.getUserInfo(userId);
      
      if (!user) {
        return res.status(404).json({ status: 404, message: 'Usuario no encontrado' });
      }

      return res.status(200).json({
        status: 200,
        message: 'Información básica del usuario',
        data: serializeBigInt(user)
      });
    } catch (error) {
      console.error('Error IA getUserInfo:', error);
      return res.status(500).json({ status: 500, message: error instanceof Error ? error.message : 'Error interno' });
    }
  }
}
