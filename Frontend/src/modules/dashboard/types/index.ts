import type { TipoMovimiento, MetodoPago } from '../../transactions/types';

export interface DashboardFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface DashboardResumen {
  total_saldo: string;
  total_ingresos: string;
  total_gastos: string;
  balance_periodo: string;
  total_deudas: string;
  total_prestamos: string;
}

export interface DashboardMovimiento {
  id: number | bigint;
  monto: string;
  tipo: TipoMovimiento;
  fecha: string;
  descripcion: string;
  metodo_pago: MetodoPago;
  cuenta: string;
  categoria: string | null;
}

export interface DashboardSummary {
  resumen: DashboardResumen;
  filtros_aplicados: {
    fecha_inicio: string;
    fecha_fin: string;
  };
  historial_movimientos: DashboardMovimiento[];
}
