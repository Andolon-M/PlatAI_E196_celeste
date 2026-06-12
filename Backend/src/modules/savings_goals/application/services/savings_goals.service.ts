import { prisma } from '../../../../config/database/db';
import { SavingsGoalsRepository } from '../../infrastructure/repositories/savings_goals.repository';
import { AccountsRepository } from '../../../accounts/infrastructure/repositories/accounts.repository';
import { PrioridadMeta, EstadoMeta, Prisma } from '@prisma/client';

export class SavingsGoalsService {
  /**
   * Obtiene todas las metas del usuario
   */
  static async getGoals(userId: bigint, filters?: { estado?: EstadoMeta }) {
    return await SavingsGoalsRepository.findManyGoals(userId, filters);
  }

  /**
   * Obtiene una meta por ID
   */
  static async getGoalById(id: bigint, userId: bigint) {
    const goal = await SavingsGoalsRepository.findGoalById(id, userId);
    if (!goal) {
      throw new Error('Meta de ahorro no encontrada o no tienes acceso');
    }
    return goal;
  }

  /**
   * Crea una nueva meta de ahorro
   */
  static async createGoal(
    userId: bigint,
    data: {
      nombre: string;
      monto_objetivo: number;
      fecha_limite: Date;
      prioridad: PrioridadMeta;
      estado?: EstadoMeta;
      icono?: string;
      color?: string;
    }
  ) {
    // Validar nombre único para el usuario
    const existing = await SavingsGoalsRepository.findGoalByName(data.nombre, userId);
    if (existing) {
      throw new Error('Ya tienes una meta de ahorro activa con este nombre');
    }

    return await SavingsGoalsRepository.createGoal(userId, data);
  }

  /**
   * Actualiza una meta de ahorro
   */
  static async updateGoal(
    id: bigint,
    userId: bigint,
    data: {
      nombre?: string;
      monto_objetivo?: number;
      fecha_limite?: Date;
      prioridad?: PrioridadMeta;
      estado?: EstadoMeta;
      icono?: string;
      color?: string;
    }
  ) {
    const goal = await this.getGoalById(id, userId);

    if (data.nombre && data.nombre !== goal.nombre) {
      const existing = await SavingsGoalsRepository.findGoalByName(data.nombre, userId);
      if (existing && existing.id !== id) {
        throw new Error('Ya tienes otra meta de ahorro con este nombre');
      }
    }

    // Si cambian el monto objetivo, validar si el monto actual ya lo cumple para actualizar estado
    let newEstado = data.estado;
    if (data.monto_objetivo !== undefined) {
      const targetMonto = Number(data.monto_objetivo);
      const currentMonto = Number(goal.monto_actual);
      if (currentMonto >= targetMonto && goal.estado === EstadoMeta.activa) {
        newEstado = EstadoMeta.completada;
      } else if (currentMonto < targetMonto && goal.estado === EstadoMeta.completada) {
        newEstado = EstadoMeta.activa;
      }
    }

    await SavingsGoalsRepository.updateGoal(id, userId, {
      ...data,
      ...(newEstado ? { estado: newEstado } : {})
    });

    return await this.getGoalById(id, userId);
  }

  /**
   * Elimina una meta de ahorro, devolviendo todos los aportes a sus cuentas de origen
   */
  static async deleteGoal(id: bigint, userId: bigint) {
    const goal = await this.getGoalById(id, userId);

    // Obtener todos los aportes de la meta para revertirlos
    const contributions = await SavingsGoalsRepository.findContributionsByGoalId(id, userId);

    await prisma.$transaction(async (tx) => {
      // Devolver cada aporte a su cuenta de origen
      for (const contribution of contributions) {
        const accountExists = await AccountsRepository.findById(contribution.id_cuenta, userId);
        if (accountExists) {
          await AccountsRepository.updateBalance(contribution.id_cuenta, Number(contribution.monto), tx);
        }
      }

      // Eliminar la meta (cascade delete elimina los aportes)
      await SavingsGoalsRepository.deleteGoal(id, userId);
    });

    const totalRefunded = contributions.reduce((sum, c) => sum + Number(c.monto), 0);
    return {
      success: true,
      message: `Meta de ahorro eliminada exitosamente. Se devolvieron ${contributions.length} aporte(s) por un total de ${totalRefunded.toFixed(2)} a sus cuentas de origen.`
    };
  }

  /**
   * Registra un aporte a una meta descontándolo de una cuenta
   */
  static async createContribution(
    userId: bigint,
    metaId: bigint,
    data: {
      id_cuenta: bigint;
      monto: number;
      nota?: string;
      fecha_aporte: Date;
    }
  ) {
    if (data.monto <= 0) {
      throw new Error('El monto del aporte debe ser mayor a cero');
    }

    // 1. Validar meta y propiedad
    const goal = await SavingsGoalsRepository.findGoalById(metaId, userId);
    if (!goal || goal.id_usuario !== userId) {
      throw new Error('Meta de ahorro no encontrada o no te pertenece');
    }

    if (goal.estado === EstadoMeta.completada) {
      throw new Error('No se pueden registrar aportes a una meta que ya está completada');
    }

    if (goal.estado === EstadoMeta.cancelada) {
      throw new Error('No se pueden registrar aportes a una meta cancelada');
    }

    // 2. Validar cuenta y propiedad
    const account = await AccountsRepository.findById(data.id_cuenta, userId);
    if (!account || account.id_usuario !== userId) {
      throw new Error('La cuenta origen no existe o no te pertenece');
    }

    if (account.estado !== 1) {
      throw new Error('La cuenta origen está archivada y no puede usarse para aportes');
    }

    // 3. Ejecutar transacción
    return await prisma.$transaction(async (tx) => {
      // A. Descontar saldo de la cuenta origen
      await AccountsRepository.updateBalance(data.id_cuenta, -data.monto, tx);

      // B. Aumentar monto acumulado de la meta
      const newMontoActual = Number(goal.monto_actual) + data.monto;
      const reachedTarget = newMontoActual >= Number(goal.monto_objetivo);

      await SavingsGoalsRepository.updateGoal(
        metaId,
        userId,
        {
          monto_actual: newMontoActual,
          ...(reachedTarget ? { estado: EstadoMeta.completada } : {})
        },
        tx
      );

      // C. Registrar aporte
      const contribution = await SavingsGoalsRepository.createContribution(userId, metaId, data, tx);

      return contribution;
    });
  }

  /**
   * Obtiene todos los aportes de una meta
   */
  static async getContributions(metaId: bigint, userId: bigint) {
    await this.getGoalById(metaId, userId);
    return await SavingsGoalsRepository.findContributionsByGoalId(metaId, userId);
  }

  /**
   * Elimina/revierte un aporte regresando el saldo a la cuenta origen
   */
  static async deleteContribution(contributionId: bigint, userId: bigint) {
    // 1. Validar existencia del aporte
    const contribution = await SavingsGoalsRepository.findContributionById(contributionId, userId);
    if (!contribution) {
      throw new Error('Aporte no encontrado o no te pertenece');
    }

    // 2. Validar existencia de la meta
    const goal = await SavingsGoalsRepository.findGoalById(contribution.id_meta, userId);
    if (!goal) {
      throw new Error('La meta asociada al aporte no existe');
    }

    // 3. Ejecutar transacción
    await prisma.$transaction(async (tx) => {
      // A. Devolver saldo a la cuenta origen (si la cuenta sigue existiendo)
      const accountExists = await AccountsRepository.findById(contribution.id_cuenta, userId);
      if (accountExists) {
        await AccountsRepository.updateBalance(contribution.id_cuenta, Number(contribution.monto), tx);
      }

      // B. Restar monto acumulado de la meta
      const newMontoActual = Math.max(0, Number(goal.monto_actual) - Number(contribution.monto));
      const isNoLongerCompleted = newMontoActual < Number(goal.monto_objetivo);

      await SavingsGoalsRepository.updateGoal(
        goal.id,
        userId,
        {
          monto_actual: newMontoActual,
          ...(goal.estado === EstadoMeta.completada && isNoLongerCompleted ? { estado: EstadoMeta.activa } : {})
        },
        tx
      );

      // C. Eliminar aporte
      await SavingsGoalsRepository.deleteContribution(contributionId, tx);
    });

    return { success: true, message: 'Aporte eliminado y saldo de cuenta restaurado exitosamente' };
  }
}
