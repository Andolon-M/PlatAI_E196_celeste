import { Request, Response } from 'express';
import { AccountsService } from '../services/accounts.service';
import { serializeBigInt } from '../../../../shared/infrastructure/utils/bigint.utils';

export class AccountsController {
  /**
   * Obtiene todas las cuentas del usuario autenticado
   */
  static async getAccounts(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const estado = req.query.estado !== undefined ? parseInt(req.query.estado as string) : undefined;

      const accounts = await AccountsService.getAccounts(userId, { estado });

      return res.status(200).json({
        status: 200,
        message: 'Cuentas obtenidas correctamente',
        data: serializeBigInt(accounts)
      });
    } catch (error) {
      console.error('Error en getAccounts controller:', error);
      return res.status(500).json({
        status: 500,
        message: 'Error al obtener las cuentas',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene una cuenta por su ID
   */
  static async getAccountById(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const id = BigInt(req.params.id);

      const account = await AccountsService.getAccountById(id, userId);

      return res.status(200).json({
        status: 200,
        message: 'Cuenta obtenida correctamente',
        data: serializeBigInt(account)
      });
    } catch (error) {
      console.error('Error en getAccountById controller:', error);
      return res.status(error instanceof Error && error.message.includes('no encontrada') ? 404 : 500).json({
        status: error instanceof Error && error.message.includes('no encontrada') ? 404 : 500,
        message: 'Error al obtener la cuenta',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Crea una nueva cuenta
   */
  static async createAccount(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const data = req.body;

      const account = await AccountsService.createAccount(userId, data);

      return res.status(201).json({
        status: 201,
        message: 'Cuenta creada exitosamente',
        data: serializeBigInt(account)
      });
    } catch (error) {
      console.error('Error en createAccount controller:', error);
      return res.status(error instanceof Error && error.message.includes('Límite') ? 403 : 400).json({
        status: error instanceof Error && error.message.includes('Límite') ? 403 : 400,
        message: 'Error al crear la cuenta',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Actualiza los datos de una cuenta
   */
  static async updateAccount(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const id = BigInt(req.params.id);
      const data = req.body;

      const account = await AccountsService.updateAccount(id, userId, data);

      return res.status(200).json({
        status: 200,
        message: 'Cuenta actualizada exitosamente',
        data: serializeBigInt(account)
      });
    } catch (error) {
      console.error('Error en updateAccount controller:', error);
      return res.status(error instanceof Error && error.message.includes('no encontrada') ? 404 : 400).json({
        status: error instanceof Error && error.message.includes('no encontrada') ? 404 : 400,
        message: 'Error al actualizar la cuenta',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Elimina/archiva una cuenta
   */
  static async deleteAccount(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const id = BigInt(req.params.id);

      await AccountsService.updateAccount(id, userId, { estado: 0 });

      return res.status(200).json({
        status: 200,
        message: 'Cuenta archivada exitosamente'
      });
    } catch (error) {
      console.error('Error en deleteAccount controller:', error);
      return res.status(error instanceof Error && error.message.includes('no encontrada') ? 404 : 400).json({
        status: error instanceof Error && error.message.includes('no encontrada') ? 404 : 400,
        message: 'Error al archivar la cuenta',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}
