import { TransactionsRepository } from '../../transactions/infrastructure/repositories/transactions.repository';
import { CategoriesRepository } from '../../categories/infrastructure/repositories/categories.repository';
import { DebtsRepository } from '../../debts/infrastructure/repositories/debts.repository';
import { AccountsRepository } from '../../accounts/infrastructure/repositories/accounts.repository';
import { TipoMovimiento, MetodoPago, TipoCategoria } from '@prisma/client';
import { prisma } from '../../../../config/database/db';

export class IAService {
  /**
   * Obtiene la información básica del usuario
   */
  static async getUserInfo(userId: bigint) {
    return await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        celular: true,
        moneda_preferida: true,
        estado: true,
      }
    });
  }
  /**
   * Obtiene la primera cuenta activa del usuario. Si no tiene, lanza error.
   */
  private static async getDefaultAccount(userId: bigint) {
    const accounts = await AccountsRepository.findAccounts(userId);
    if (accounts.length === 0) {
      throw new Error('El usuario no tiene ninguna cuenta bancaria activa configurada.');
    }
    return accounts[0].id;
  }

  /**
   * Registra un ingreso o gasto desde la IA
   */
  static async registerMovement(userId: bigint, data: {
    tipo: TipoMovimiento;
    monto: number;
    descripcion: string;
    id_categoria?: bigint;
    id_cuenta?: bigint;
    fecha?: Date;
    metodo_pago?: MetodoPago;
  }) {
    // Si no manda id_cuenta, usar la primera disponible
    const id_cuenta = data.id_cuenta || await this.getDefaultAccount(userId);

    // Si no manda categoría, le asignamos la primera disponible que coincida con el tipo
    let id_categoria = data.id_categoria;
    if (!id_categoria) {
      const cats = await CategoriesRepository.findAvailableCategories(userId, data.tipo === 'ingreso' ? TipoCategoria.ingreso : TipoCategoria.gasto);
      if (cats.length > 0) {
        id_categoria = cats[0].id;
      } else {
        throw new Error(`El usuario no tiene categorías de tipo ${data.tipo} configuradas.`);
      }
    }

    const payload = {
      id_cuenta: id_cuenta,
      id_categoria: id_categoria,
      tipo: data.tipo,
      monto: data.monto,
      descripcion: data.descripcion,
      fecha: data.fecha || new Date(),
      metodo_pago: data.metodo_pago || MetodoPago.Efectivo,
      origen_ia: 1 // Bandera para saber que vino de IA
    };

    return await TransactionsRepository.createMovement(userId, payload);
  }

  /**
   * Obtiene las categorías de ingresos o gastos
   */
  static async getCategories(userId: bigint, tipo?: 'ingreso' | 'gasto') {
    let tipoCat: TipoCategoria | undefined;
    if (tipo === 'ingreso') tipoCat = TipoCategoria.ingreso;
    if (tipo === 'gasto') tipoCat = TipoCategoria.gasto;

    return await CategoriesRepository.findAvailableCategories(userId, tipoCat);
  }

  /**
   * Obtiene el estado actual de las deudas
   */
  static async getDebtsStatus(userId: bigint) {
    return await DebtsRepository.findManyDebts(userId);
  }
}
