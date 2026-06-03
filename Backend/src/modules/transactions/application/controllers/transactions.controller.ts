import { Request, Response } from 'express';
import { TransactionsService } from '../services/transactions.service';
import { serializeBigInt } from '../../../../shared/infrastructure/utils/bigint.utils';
import { TipoMovimiento } from '@prisma/client';

export class TransactionsController {
  /**
   * Obtiene todos los movimientos no eliminados del usuario
   */
  static async getTransactions(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);

      const filters = {
        id_cuenta: req.query.id_cuenta ? BigInt(req.query.id_cuenta as string) : undefined,
        id_categoria: req.query.id_categoria ? BigInt(req.query.id_categoria as string) : undefined,
        tipo: req.query.tipo as TipoMovimiento | undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        search: req.query.search as string
      };

      const pagination = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined
      };

      const result = await TransactionsService.getTransactions(userId, filters, pagination);

      return res.status(200).json({
        status: 200,
        message: 'Movimientos obtenidos correctamente',
        data: serializeBigInt(result)
      });
    } catch (error) {
      console.error('Error en getTransactions controller:', error);
      return res.status(500).json({
        status: 500,
        message: 'Error al obtener los movimientos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene un movimiento específico por su ID
   */
  static async getTransactionById(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const id = BigInt(req.params.id);

      const transaction = await TransactionsService.getTransactionById(id, userId);

      return res.status(200).json({
        status: 200,
        message: 'Movimiento obtenido correctamente',
        data: serializeBigInt(transaction)
      });
    } catch (error) {
      console.error('Error en getTransactionById controller:', error);
      const isNotFound = error instanceof Error && error.message.includes('no encontrado');
      return res.status(isNotFound ? 404 : 500).json({
        status: isNotFound ? 404 : 500,
        message: 'Error al obtener el movimiento',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Crea un nuevo movimiento (Ingreso o Gasto)
   */
  static async createTransaction(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const data = req.body;

      // Conversión explícita a BigInt y fecha adecuada
      const movementData = {
        id_cuenta: BigInt(data.id_cuenta),
        id_categoria: BigInt(data.id_categoria),
        tipo: data.tipo as TipoMovimiento,
        monto: Number(data.monto),
        descripcion: data.descripcion,
        fecha: new Date(data.fecha),
        metodo_pago: data.metodo_pago,
        nota: data.nota,
        origen_ia: data.origen_ia
      };

      const result = await TransactionsService.createTransaction(userId, movementData);

      return res.status(201).json({
        status: 201,
        message: 'Movimiento registrado exitosamente',
        data: serializeBigInt(result)
      });
    } catch (error) {
      console.error('Error en createTransaction controller:', error);
      return res.status(400).json({
        status: 400,
        message: 'Error al registrar el movimiento',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Actualiza un movimiento existente
   */
  static async updateTransaction(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const id = BigInt(req.params.id);
      const data = req.body;

      // Conversión explícita si se proveen
      const updateData = {
        ...(data.id_cuenta ? { id_cuenta: BigInt(data.id_cuenta) } : {}),
        ...(data.id_categoria ? { id_categoria: BigInt(data.id_categoria) } : {}),
        ...(data.tipo ? { tipo: data.tipo as TipoMovimiento } : {}),
        ...(data.monto !== undefined ? { monto: Number(data.monto) } : {}),
        ...(data.descripcion ? { descripcion: data.descripcion } : {}),
        ...(data.fecha ? { fecha: new Date(data.fecha) } : {}),
        ...(data.metodo_pago ? { metodo_pago: data.metodo_pago } : {}),
        ...(data.nota !== undefined ? { nota: data.nota } : {}),
        ...(data.origen_ia !== undefined ? { origen_ia: data.origen_ia } : {})
      };

      const result = await TransactionsService.updateTransaction(id, userId, updateData);

      return res.status(200).json({
        status: 200,
        message: 'Movimiento actualizado exitosamente',
        data: serializeBigInt(result)
      });
    } catch (error) {
      console.error('Error en updateTransaction controller:', error);
      const isNotFound = error instanceof Error && error.message.includes('no encontrado');
      return res.status(isNotFound ? 404 : 400).json({
        status: isNotFound ? 404 : 400,
        message: 'Error al actualizar el movimiento',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Elimina lógicamente un movimiento (Soft Delete) y revierte su impacto en el saldo
   */
  static async deleteTransaction(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const id = BigInt(req.params.id);

      const result = await TransactionsService.deleteTransaction(id, userId);

      return res.status(200).json({
        status: 200,
        message: result.message
      });
    } catch (error) {
      console.error('Error en deleteTransaction controller:', error);
      const isNotFound = error instanceof Error && error.message.includes('no encontrado');
      return res.status(isNotFound ? 404 : 400).json({
        status: isNotFound ? 404 : 400,
        message: 'Error al eliminar el movimiento',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Registra una transferencia de fondos entre dos cuentas
   */
  static async createTransfer(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const data = req.body;

      const transferData = {
        id_cuenta_origen: BigInt(data.id_cuenta_origen),
        id_cuenta_destino: BigInt(data.id_cuenta_destino),
        monto: Number(data.monto),
        nota: data.nota,
        fecha_transferencia: new Date(data.fecha_transferencia)
      };

      const result = await TransactionsService.createTransfer(userId, transferData);

      return res.status(201).json({
        status: 201,
        message: 'Transferencia realizada exitosamente',
        data: serializeBigInt(result)
      });
    } catch (error) {
      console.error('Error en createTransfer controller:', error);
      return res.status(400).json({
        status: 400,
        message: 'Error al realizar la transferencia',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene el listado de transferencias
   */
  static async getTransfers(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);

      const filters = {
        id_cuenta_origen: req.query.id_cuenta_origen ? BigInt(req.query.id_cuenta_origen as string) : undefined,
        id_cuenta_destino: req.query.id_cuenta_destino ? BigInt(req.query.id_cuenta_destino as string) : undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };

      const pagination = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined
      };

      const result = await TransactionsService.getTransfers(userId, filters, pagination);

      return res.status(200).json({
        status: 200,
        message: 'Transferencias obtenidas correctamente',
        data: serializeBigInt(result)
      });
    } catch (error) {
      console.error('Error en getTransfers controller:', error);
      return res.status(500).json({
        status: 500,
        message: 'Error al obtener las transferencias',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}
