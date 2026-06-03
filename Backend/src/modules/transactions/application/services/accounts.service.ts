import { AccountsRepository } from '../../infrastructure/repositories/accounts.repository';
import { UserCapabilitiesRepository } from '../../../../shared/infrastructure/repositories/user-capabilities.repository';
import { TipoCuenta } from '@prisma/client';

export class AccountsService {
  /**
   * Obtiene todas las cuentas del usuario
   */
  static async getAccounts(userId: bigint, filters?: { estado?: number }) {
    return await AccountsRepository.findManyByUserId(userId, filters);
  }

  /**
   * Obtiene una cuenta por su ID
   */
  static async getAccountById(id: bigint, userId: bigint) {
    const account = await AccountsRepository.findById(id, userId);
    if (!account) {
      throw new Error('Cuenta no encontrada o no pertenece al usuario');
    }
    return account;
  }

  /**
   * Crea una nueva cuenta aplicando límites de suscripción
   */
  static async createAccount(
    userId: bigint,
    data: {
      nombre: string;
      tipo: TipoCuenta;
      saldo?: number;
      color?: string;
    }
  ) {
    // 1. Validar nombre único para el usuario
    const existingAccount = await AccountsRepository.findByName(data.nombre, userId);
    if (existingAccount && existingAccount.estado === 1) {
      throw new Error('Ya existe una cuenta activa con este nombre');
    }

    // 2. Control de Límites por Suscripción (Monetización)
    const subscription = await UserCapabilitiesRepository.getUserSubscription(userId);
    const userActiveAccounts = await AccountsRepository.findManyByUserId(userId, { estado: 1 });

    if (!subscription || subscription.name === 'Gratuito') {
      // Plan gratuito: límite de 3 cuentas
      if (userActiveAccounts.length >= 3) {
        throw new Error('Límite de cuentas alcanzado. El plan Gratuito solo permite hasta 3 cuentas activas. ¡Actualiza a Premium para cuentas ilimitadas!');
      }
    }

    return await AccountsRepository.create(userId, data);
  }

  /**
   * Actualiza una cuenta existente
   */
  static async updateAccount(
    id: bigint,
    userId: bigint,
    data: {
      nombre?: string;
      tipo?: TipoCuenta;
      color?: string;
      estado?: number;
    }
  ) {
    const account = await AccountsRepository.findById(id, userId);
    if (!account) {
      throw new Error('Cuenta no encontrada o no pertenece al usuario');
    }

    if (data.nombre && data.nombre !== account.nombre) {
      const existingAccount = await AccountsRepository.findByName(data.nombre, userId);
      if (existingAccount && existingAccount.id !== id && existingAccount.estado === 1) {
        throw new Error('Ya existe otra cuenta activa con este nombre');
      }
    }

    await AccountsRepository.update(id, userId, data);
    return await AccountsRepository.findById(id, userId);
  }
}
