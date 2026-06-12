import { prisma } from '../../../../config/database/db';
import { Prisma } from '@prisma/client';

export class DashboardRepository {
  /**
   * Obtiene la suma total de saldos de todas las cuentas activas del usuario
   */
  static async getTotalBalance(userId: bigint) {
    const result = await prisma.cuentas.aggregate({
      where: {
        id_usuario: userId,
        estado: 1
      },
      _sum: {
        saldo: true
      }
    });
    return Number(result._sum.saldo ?? 0);
  }

  /**
   * Obtiene el total de gastos en un rango de fechas
   */
  static async getTotalExpenses(userId: bigint, startDate: Date, endDate: Date) {
    const result = await prisma.movimientos.aggregate({
      where: {
        id_usuario: userId,
        tipo: 'gasto',
        eliminado: 0,
        fecha: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        monto: true
      }
    });
    return Number(result._sum.monto ?? 0);
  }

  /**
   * Obtiene el total de ingresos en un rango de fechas
   */
  static async getTotalIncome(userId: bigint, startDate: Date, endDate: Date) {
    const result = await prisma.movimientos.aggregate({
      where: {
        id_usuario: userId,
        tipo: 'ingreso',
        eliminado: 0,
        fecha: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        monto: true
      }
    });
    return Number(result._sum.monto ?? 0);
  }

  /**
   * Obtiene el total de deudas activas (yo_debo) - no pagadas ni canceladas
   */
  static async getTotalDebts(userId: bigint) {
    const debts = await prisma.deudas_prestamos.findMany({
      where: {
        id_usuario: userId,
        tipo: 'yo_debo',
        estado: { notIn: ['pagada', 'cancelada'] }
      },
      include: {
        abonos: true
      }
    });

    return debts.reduce((total, debt) => {
      const totalAbonado = debt.abonos.reduce((sum, a) => sum + Number(a.monto_abonado), 0);
      return total + (Number(debt.monto_total) - totalAbonado);
    }, 0);
  }

  /**
   * Obtiene el total de préstamos activos (me_deben) - no pagados ni cancelados
   */
  static async getTotalLoans(userId: bigint) {
    const loans = await prisma.deudas_prestamos.findMany({
      where: {
        id_usuario: userId,
        tipo: 'me_deben',
        estado: { notIn: ['pagada', 'cancelada'] }
      },
      include: {
        abonos: true
      }
    });

    return loans.reduce((total, loan) => {
      const totalAbonado = loan.abonos.reduce((sum, a) => sum + Number(a.monto_abonado), 0);
      return total + (Number(loan.monto_total) - totalAbonado);
    }, 0);
  }

  /**
   * Obtiene el historial de movimientos (ingresos y gastos) en un rango de fechas
   * con el detalle de la categoría (nombre y color)
   */
  static async getTransactionHistory(userId: bigint, startDate: Date, endDate: Date) {
    return await prisma.movimientos.findMany({
      where: {
        id_usuario: userId,
        eliminado: 0,
        fecha: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        categoria: {
          select: {
            nombre: true,
            color: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });
  }
}
