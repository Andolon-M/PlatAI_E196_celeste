import { DashboardRepository } from '../../infrastructure/repositories/dashboard.repository';

export class DashboardService {
  /**
   * Genera las fechas por defecto (mes actual) si no se proporcionan filtros.
   * startDate: hora 00:00:00.000 del día de inicio
   * endDate:   hora 23:59:59.999 del día final
   */
  private static getDateRange(startDate?: Date, endDate?: Date): { start: Date; end: Date } {
    const now = new Date();

    // Por defecto: primer y último día del mes actual
    const start = startDate
      ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0)
      : new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    const end = endDate
      ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    return { start, end };
  }

  /**
   * Obtiene todos los datos del dashboard en una sola llamada
   */
  static async getDashboardSummary(
    userId: bigint,
    filters?: { fecha_inicio?: Date; fecha_fin?: Date }
  ) {
    const { start, end } = this.getDateRange(filters?.fecha_inicio, filters?.fecha_fin);

    // Ejecutar todas las consultas en paralelo para mejor rendimiento
    const [
      totalSaldo,
      totalGastos,
      totalIngresos,
      totalDeudas,
      totalPrestamos,
      historialMovimientos
    ] = await Promise.all([
      DashboardRepository.getTotalBalance(userId),
      DashboardRepository.getTotalExpenses(userId, start, end),
      DashboardRepository.getTotalIncome(userId, start, end),
      DashboardRepository.getTotalDebts(userId),
      DashboardRepository.getTotalLoans(userId),
      DashboardRepository.getTransactionHistory(userId, start, end)
    ]);

    return {
      resumen: {
        total_saldo: totalSaldo.toFixed(2),
        total_ingresos: totalIngresos.toFixed(2),
        total_gastos: totalGastos.toFixed(2),
        balance_periodo: (totalIngresos - totalGastos).toFixed(2),
        total_deudas: totalDeudas.toFixed(2),
        total_prestamos: totalPrestamos.toFixed(2)
      },
      filtros_aplicados: {
        fecha_inicio: start.toISOString(),
        fecha_fin: end.toISOString()
      },
      historial_movimientos: historialMovimientos
    };
  }
}
