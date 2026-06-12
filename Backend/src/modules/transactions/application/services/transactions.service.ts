import { prisma } from '../../../../config/database/db';
import { TransactionsRepository } from '../../infrastructure/repositories/transactions.repository';
import { AccountsRepository } from '../../../accounts/infrastructure/repositories/accounts.repository';
import { CategoriesRepository } from '../../../categories/infrastructure/repositories/categories.repository';
import { TipoMovimiento, MetodoPago, TipoCategoria } from '@prisma/client';
import { AccountsService } from '../../../accounts/application/services/accounts.service';

export class TransactionsService {
  /**
   * Obtiene movimientos con filtros y paginación
   */
  static async getTransactions(
    userId: bigint,
    filters?: {
      id_cuenta?: bigint;
      id_categoria?: bigint;
      tipo?: TipoMovimiento;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    },
    pagination?: {
      page?: number;
      pageSize?: number;
    }
  ) {
    return await TransactionsRepository.findMany(userId, filters, pagination);
  }

  /**
   * Obtiene un movimiento específico por su ID
   */
  static async getTransactionById(id: bigint, userId: bigint) {
    const transaction = await TransactionsRepository.findById(id, userId);
    if (!transaction) {
      throw new Error('Movimiento no encontrado o no pertenece al usuario');
    }
    return transaction;
  }

  /**
   * Crea un movimiento (Ingreso o Gasto) ajustando atómicamente el saldo de la cuenta
   */
  static async createTransaction(
    userId: bigint,
    data: {
      id_cuenta: bigint;
      id_categoria: bigint;
      tipo: TipoMovimiento;
      monto: number;
      descripcion: string;
      fecha: Date;
      metodo_pago: MetodoPago;
      nota?: string;
      origen_ia?: number;
    }
  ) {
    // 1. Validar que la cuenta existe, está activa y pertenece al usuario
    const account = await AccountsRepository.findById(data.id_cuenta, userId);
    if (!account) {
      throw new Error('La cuenta de destino no existe o no te pertenece');
    }
    if (account.estado !== 1) {
      throw new Error('La cuenta seleccionada está archivada y no puede recibir movimientos');
    }

    // 2. Validar que la categoría existe, está activa y es compatible con el tipo de movimiento
    const category = await CategoriesRepository.findById(data.id_categoria, userId);
    if (!category) {
      throw new Error('La categoría seleccionada no existe');
    }
    if (category.estado !== 1) {
      throw new Error('La categoría seleccionada está inactiva');
    }

    // Validar tipo de categoría (ingreso, gasto, ambos)
    if (
      category.tipo !== TipoCategoria.ambos &&
      category.tipo.toString() !== data.tipo.toString()
    ) {
      throw new Error(`La categoría '${category.nombre}' es de tipo ${category.tipo} y no es compatible con un movimiento de tipo ${data.tipo}`);
    }

    // 3. Ejecutar transacción de base de datos para mantener consistencia de saldos
    return await prisma.$transaction(async (tx) => {
      // Registrar el movimiento
      const movement = await TransactionsRepository.createMovement(userId, data, tx);

      // Calcular el cambio en el saldo
      // Ingreso -> Sumar saldo
      // Gasto -> Restar saldo
      const balanceChange = data.tipo === TipoMovimiento.ingreso ? data.monto : -data.monto;

      // Actualizar saldo de la cuenta
      await AccountsRepository.updateBalance(data.id_cuenta, balanceChange, tx);

      return movement;
    });
  }

  /**
   * Actualiza un movimiento modificando de forma consistente los saldos (incluso si cambia de cuenta o tipo)
   */
  static async updateTransaction(
    id: bigint,
    userId: bigint,
    data: {
      id_cuenta?: bigint;
      id_categoria?: bigint;
      tipo?: TipoMovimiento;
      monto?: number;
      descripcion?: string;
      fecha?: Date;
      metodo_pago?: MetodoPago;
      nota?: string;
      origen_ia?: number;
    }
  ) {
    // 1. Validar existencia del movimiento actual
    const oldMovement = await TransactionsRepository.findById(id, userId);
    if (!oldMovement) {
      throw new Error('Movimiento no encontrado o no pertenece al usuario');
    }

    const newAccountId = data.id_cuenta ?? oldMovement.id_cuenta;
    const newCategoryId = data.id_categoria ?? oldMovement.id_categoria;
    const newTipo = data.tipo ?? oldMovement.tipo;
    const newMonto = data.monto ?? Number(oldMovement.monto);

    // 2. Validaciones básicas si cambiaron campos relacionales
    if (data.id_cuenta && data.id_cuenta !== oldMovement.id_cuenta) {
      const account = await AccountsRepository.findById(data.id_cuenta, userId);
      if (!account || account.estado !== 1) {
        throw new Error('La nueva cuenta no es válida o está archivada');
      }
    }

    if (data.id_categoria && data.id_categoria !== oldMovement.id_categoria) {
      const category = await CategoriesRepository.findById(data.id_categoria, userId);
      if (!category || category.estado !== 1) {
        throw new Error('La nueva categoría no es válida o está inactiva');
      }
      if (
        category.tipo !== TipoCategoria.ambos &&
        category.tipo.toString() !== newTipo.toString()
      ) {
        throw new Error(`La categoría '${category.nombre}' no es compatible con un movimiento de tipo ${newTipo}`);
      }
    }

    // 3. Ejecutar transacción de base de datos para la reversión y aplicación del nuevo impacto financiero
    return await prisma.$transaction(async (tx) => {
      // A. REVERSIÓN: Deshacer impacto anterior en la cuenta anterior
      const oldBalanceReversal =
        oldMovement.tipo === TipoMovimiento.ingreso
          ? -Number(oldMovement.monto) // Restar lo que se había sumado
          : Number(oldMovement.monto); // Sumar lo que se había restado

      await AccountsRepository.updateBalance(oldMovement.id_cuenta, oldBalanceReversal, tx);

      // B. APLICACIÓN: Aplicar el nuevo impacto en la nueva cuenta
      const newBalanceApply = newTipo === TipoMovimiento.ingreso ? newMonto : -newMonto;

      await AccountsRepository.updateBalance(newAccountId, newBalanceApply, tx);

      // C. Actualizar los datos del movimiento
      const updatedMovement = await TransactionsRepository.updateMovement(id, userId, data, tx);

      return updatedMovement;
    });
  }

  /**
   * Elimina lógicamente un movimiento (Soft Delete) y revierte su impacto en el saldo de la cuenta
   */
  static async deleteTransaction(id: bigint, userId: bigint) {
    const movement = await TransactionsRepository.findById(id, userId);
    if (!movement) {
      throw new Error('Movimiento no encontrado o no pertenece al usuario');
    }

    // Ejecutar en transacción
    await prisma.$transaction(async (tx) => {
      // Revertir el saldo en la cuenta asociada
      // Si era un ingreso -> Restar
      // Si era un gasto -> Sumar
      const balanceReversal =
        movement.tipo === TipoMovimiento.ingreso
          ? -Number(movement.monto)
          : Number(movement.monto);

      await AccountsRepository.updateBalance(movement.id_cuenta, balanceReversal, tx);

      // Soft delete
      await TransactionsRepository.deleteMovement(id, tx);
    });

    return { success: true, message: 'Movimiento eliminado exitosamente y saldo de cuenta restaurado' };
  }

  /**
   * Registra una transferencia de fondos entre dos cuentas del usuario
   */
  static async createTransfer(
    userId: bigint,
    data: {
      id_cuenta_origen: bigint;
      id_cuenta_destino: bigint;
      monto: number;
      nota?: string;
      fecha_transferencia: Date;
    }
  ) {
    return await AccountsService.createTransfer(userId, data);
  }

  /**
   * Obtiene listado de transferencias
   */
  static async getTransfers(
    userId: bigint,
    filters?: {
      id_cuenta_origen?: bigint;
      id_cuenta_destino?: bigint;
      startDate?: Date;
      endDate?: Date;
    },
    pagination?: {
      page?: number;
      pageSize?: number;
    }
  ) {
    return await TransactionsRepository.findTransfers(userId, filters, pagination);
  }
}
