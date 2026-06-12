import { prisma } from '../../../../config/database/db';
import { DebtsRepository } from '../../infrastructure/repositories/debts.repository';
import { TipoDeuda, EstadoDeuda } from '@prisma/client';

export class DebtsService {
  /**
   * Calcula el monto pendiente y lo agrega al objeto de deuda
   */
  private static calculatePending(debt: any) {
    const totalAbonado = debt.abonos
      ? debt.abonos.reduce((sum: number, a: any) => sum + Number(a.monto_abonado), 0)
      : 0;
    const montoPendiente = Math.max(0, Number(debt.monto_total) - totalAbonado);
    return {
      ...debt,
      monto_pendiente: montoPendiente.toFixed(2),
      total_abonado: totalAbonado.toFixed(2)
    };
  }

  /**
   * Obtiene todas las deudas del usuario con monto_pendiente calculado
   */
  static async getDebts(userId: bigint, filters?: { tipo?: TipoDeuda; estado?: EstadoDeuda }) {
    const debts = await DebtsRepository.findManyDebts(userId, filters);
    return debts.map(this.calculatePending);
  }

  /**
   * Obtiene una deuda por ID con monto_pendiente calculado
   */
  static async getDebtById(id: bigint, userId: bigint) {
    const debt = await DebtsRepository.findDebtById(id, userId);
    if (!debt) {
      throw new Error('Deuda o préstamo no encontrado o no tienes acceso');
    }
    return this.calculatePending(debt);
  }

  /**
   * Crea una nueva deuda/préstamo
   */
  static async createDebt(
    userId: bigint,
    data: {
      tipo: TipoDeuda;
      persona_entidad: string;
      monto_total: number;
      descripcion?: string;
      fecha_vencimiento?: Date;
    }
  ) {
    return await DebtsRepository.createDebt(userId, {
      ...data,
      estado: EstadoDeuda.pendiente
    });
  }

  /**
   * Actualiza una deuda/préstamo
   */
  static async updateDebt(
    id: bigint,
    userId: bigint,
    data: {
      tipo?: TipoDeuda;
      persona_entidad?: string;
      monto_total?: number;
      descripcion?: string;
      fecha_vencimiento?: Date;
      estado?: EstadoDeuda;
    }
  ) {
    const debt = await DebtsRepository.findDebtById(id, userId);
    if (!debt) {
      throw new Error('Deuda o préstamo no encontrado o no tienes acceso');
    }

    // Si cambian el monto_total, validar que no sea menor a lo ya abonado
    if (data.monto_total !== undefined) {
      const totalAbonado = await DebtsRepository.sumPaymentsByDebtId(id);
      if (data.monto_total < totalAbonado) {
        throw new Error(
          `No se puede reducir el monto total a ${data.monto_total} porque ya se han abonado ${totalAbonado.toFixed(2)}`
        );
      }
    }

    await DebtsRepository.updateDebt(id, userId, data);
    return await this.getDebtById(id, userId);
  }

  /**
   * Elimina una deuda, bloqueando si tiene abonos existentes
   */
  static async deleteDebt(id: bigint, userId: bigint) {
    const debt = await DebtsRepository.findDebtById(id, userId);
    if (!debt) {
      throw new Error('Deuda o préstamo no encontrado o no tienes acceso');
    }

    const paymentCount = await DebtsRepository.countPaymentsByDebtId(id);
    if (paymentCount > 0) {
      throw new Error(
        `No se puede eliminar esta deuda porque tiene ${paymentCount} abono(s) registrado(s). Elimina los abonos primero.`
      );
    }

    await DebtsRepository.deleteDebt(id, userId);
    return { success: true, message: 'Deuda o préstamo eliminado exitosamente' };
  }

  /**
   * Registra un abono a una deuda
   */
  static async createPayment(
    userId: bigint,
    debtId: bigint,
    data: {
      monto_abonado: number;
      nota?: string;
      fecha_abono: Date;
    }
  ) {
    if (data.monto_abonado <= 0) {
      throw new Error('El monto del abono debe ser mayor a cero');
    }

    // 1. Validar deuda y propiedad
    const debt = await DebtsRepository.findDebtById(debtId, userId);
    if (!debt || debt.id_usuario !== userId) {
      throw new Error('Deuda o préstamo no encontrado o no te pertenece');
    }

    if (debt.estado === EstadoDeuda.pagada) {
      throw new Error('No se pueden registrar abonos a una deuda que ya está pagada');
    }

    if (debt.estado === EstadoDeuda.cancelada) {
      throw new Error('No se pueden registrar abonos a una deuda cancelada');
    }

    // 2. Validar que el abono no exceda el pendiente
    const totalAbonado = await DebtsRepository.sumPaymentsByDebtId(debtId);
    const pendiente = Number(debt.monto_total) - totalAbonado;

    if (data.monto_abonado > pendiente) {
      throw new Error(
        `El monto del abono (${data.monto_abonado}) excede el saldo pendiente (${pendiente.toFixed(2)})`
      );
    }

    // 3. Ejecutar transacción
    return await prisma.$transaction(async (tx) => {
      // A. Registrar abono
      const payment = await DebtsRepository.createPayment(userId, debtId, data, tx);

      // B. Recalcular estado de la deuda
      const newTotalAbonado = totalAbonado + data.monto_abonado;
      const montoTotal = Number(debt.monto_total);

      let newEstado: EstadoDeuda;
      if (newTotalAbonado >= montoTotal) {
        newEstado = EstadoDeuda.pagada;
      } else if (newTotalAbonado > 0) {
        newEstado = EstadoDeuda.parcial;
      } else {
        newEstado = EstadoDeuda.pendiente;
      }

      if (newEstado !== debt.estado) {
        await DebtsRepository.updateDebt(debtId, userId, { estado: newEstado });
      }

      return payment;
    });
  }

  /**
   * Obtiene todos los abonos de una deuda
   */
  static async getPayments(debtId: bigint, userId: bigint) {
    // Validar que la deuda exista y pertenezca al usuario
    const debt = await DebtsRepository.findDebtById(debtId, userId);
    if (!debt) {
      throw new Error('Deuda o préstamo no encontrado o no tienes acceso');
    }
    return await DebtsRepository.findPaymentsByDebtId(debtId, userId);
  }

  /**
   * Elimina/revierte un abono, recalculando el estado de la deuda
   */
  static async deletePayment(paymentId: bigint, userId: bigint) {
    // 1. Validar existencia del abono
    const payment = await DebtsRepository.findPaymentById(paymentId, userId);
    if (!payment) {
      throw new Error('Abono no encontrado o no te pertenece');
    }

    // 2. Validar existencia de la deuda
    const debt = await DebtsRepository.findDebtById(payment.id_deuda, userId);
    if (!debt) {
      throw new Error('La deuda asociada al abono no existe');
    }

    // 3. Ejecutar transacción
    await prisma.$transaction(async (tx) => {
      // A. Eliminar abono
      await DebtsRepository.deletePayment(paymentId, tx);

      // B. Recalcular estado
      const totalAbonado = await DebtsRepository.sumPaymentsByDebtId(debt.id);
      const newTotalAbonado = totalAbonado - Number(payment.monto_abonado);
      const montoTotal = Number(debt.monto_total);

      let newEstado: EstadoDeuda;
      if (newTotalAbonado >= montoTotal) {
        newEstado = EstadoDeuda.pagada;
      } else if (newTotalAbonado > 0) {
        newEstado = EstadoDeuda.parcial;
      } else {
        newEstado = EstadoDeuda.pendiente;
      }

      if (newEstado !== debt.estado) {
        await DebtsRepository.updateDebt(debt.id, userId, { estado: newEstado });
      }
    });

    return { success: true, message: 'Abono eliminado exitosamente y estado de la deuda recalculado' };
  }
}
