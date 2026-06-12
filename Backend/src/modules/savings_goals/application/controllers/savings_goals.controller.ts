import { Request, Response } from 'express';
import { SavingsGoalsService } from '../services/savings_goals.service';
import { serializeBigInt } from '../../../../shared/infrastructure/utils/bigint.utils';
import { EstadoMeta } from '@prisma/client';

export class SavingsGoalsController {
  /**
   * Obtiene todas las metas del usuario
   */
  static async getGoals(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const estado = req.query.estado as EstadoMeta | undefined;

      const goals = await SavingsGoalsService.getGoals(userId, { estado });

      return res.status(200).json({
        status: 200,
        message: 'Metas de ahorro obtenidas correctamente',
        data: serializeBigInt(goals)
      });
    } catch (error) {
      console.error('Error en getGoals controller:', error);
      return res.status(500).json({
        status: 500,
        message: 'Error al obtener las metas de ahorro',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene una meta por su ID
   */
  static async getGoalById(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const id = BigInt(req.params.id);

      const goal = await SavingsGoalsService.getGoalById(id, userId);

      return res.status(200).json({
        status: 200,
        message: 'Meta de ahorro obtenida correctamente',
        data: serializeBigInt(goal)
      });
    } catch (error) {
      console.error('Error en getGoalById controller:', error);
      const isNotFound = error instanceof Error && error.message.includes('no encontrada');
      return res.status(isNotFound ? 404 : 500).json({
        status: isNotFound ? 404 : 500,
        message: 'Error al obtener la meta de ahorro',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Crea una nueva meta de ahorro
   */
  static async createGoal(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const data = req.body;

      const goal = await SavingsGoalsService.createGoal(userId, data);

      return res.status(201).json({
        status: 201,
        message: 'Meta de ahorro creada exitosamente',
        data: serializeBigInt(goal)
      });
    } catch (error) {
      console.error('Error en createGoal controller:', error);
      return res.status(400).json({
        status: 400,
        message: 'Error al crear la meta de ahorro',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Actualiza una meta de ahorro
   */
  static async updateGoal(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const id = BigInt(req.params.id);
      const data = req.body;

      const goal = await SavingsGoalsService.updateGoal(id, userId, data);

      return res.status(200).json({
        status: 200,
        message: 'Meta de ahorro actualizada exitosamente',
        data: serializeBigInt(goal)
      });
    } catch (error) {
      console.error('Error en updateGoal controller:', error);
      const isNotFound = error instanceof Error && error.message.includes('no encontrada');
      return res.status(isNotFound ? 404 : 400).json({
        status: isNotFound ? 404 : 400,
        message: 'Error al actualizar la meta de ahorro',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Elimina una meta de ahorro
   */
  static async deleteGoal(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const id = BigInt(req.params.id);

      const result = await SavingsGoalsService.deleteGoal(id, userId);

      return res.status(200).json({
        status: 200,
        message: result.message
      });
    } catch (error) {
      console.error('Error en deleteGoal controller:', error);
      const isNotFound = error instanceof Error && error.message.includes('no encontrada');
      return res.status(isNotFound ? 404 : 400).json({
        status: isNotFound ? 404 : 400,
        message: 'Error al eliminar la meta de ahorro',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Registra un aporte a una meta
   */
  static async createContribution(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const metaId = BigInt(req.params.id);
      const data = req.body;

      const contributionData = {
        id_cuenta: BigInt(data.id_cuenta),
        monto: Number(data.monto),
        nota: data.nota,
        fecha_aporte: new Date(data.fecha_aporte)
      };

      const result = await SavingsGoalsService.createContribution(userId, metaId, contributionData);

      return res.status(201).json({
        status: 201,
        message: 'Aporte registrado exitosamente en la meta',
        data: serializeBigInt(result)
      });
    } catch (error) {
      console.error('Error en createContribution controller:', error);
      return res.status(400).json({
        status: 400,
        message: 'Error al registrar el aporte',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene todos los aportes de una meta
   */
  static async getContributions(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const metaId = BigInt(req.params.id);

      const contributions = await SavingsGoalsService.getContributions(metaId, userId);

      return res.status(200).json({
        status: 200,
        message: 'Aportes obtenidos correctamente',
        data: serializeBigInt(contributions)
      });
    } catch (error) {
      console.error('Error en getContributions controller:', error);
      const isNotFound = error instanceof Error && error.message.includes('no encontrada');
      return res.status(isNotFound ? 404 : 500).json({
        status: isNotFound ? 404 : 500,
        message: 'Error al obtener los aportes',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Elimina/revierte un aporte
   */
  static async deleteContribution(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const contributionId = BigInt(req.params.contributionId);

      const result = await SavingsGoalsService.deleteContribution(contributionId, userId);

      return res.status(200).json({
        status: 200,
        message: result.message
      });
    } catch (error) {
      console.error('Error en deleteContribution controller:', error);
      return res.status(400).json({
        status: 400,
        message: 'Error al eliminar el aporte',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}
