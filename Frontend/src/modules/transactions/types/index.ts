export type TipoMovimiento = 'INGRESO' | 'GASTO';
export type MetodoPago = 'EFECTIVO' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'TRANSFERENCIA' | 'OTRO';

export interface Category {
  id: number;
  nombre: string;
  tipo: 'INGRESO' | 'GASTO';
  color?: string;
  icono?: string;
}

export interface Transaction {
  id: number;
  id_cuenta: number;
  id_categoria: number;
  tipo: TipoMovimiento;
  monto: number;
  descripcion: string;
  fecha: string;
  metodo_pago: MetodoPago;
  nota?: string | null;
  origen_ia?: number;
  estado: number;
  fecha_creacion?: string;
  
  // Relaciones
  cuenta?: {
    nombre: string;
  };
  categoria?: {
    nombre: string;
    color?: string;
  };
}

export interface CreateTransactionDto {
  id_cuenta: number;
  id_categoria: number;
  tipo: TipoMovimiento;
  monto: number;
  descripcion: string;
  fecha: string;
  metodo_pago: MetodoPago;
  nota?: string;
}

export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {}

export interface TransactionFilters {
  id_cuenta?: number;
  id_categoria?: number;
  tipo?: TipoMovimiento;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedTransactions {
  items: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
