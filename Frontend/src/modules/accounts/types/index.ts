export type TipoCuenta = 'Efectivo' | 'Digital' | 'Banco' | 'Otro';

export interface Account {
  id: number;
  usuario_id: string;
  nombre: string;
  tipo: TipoCuenta;
  saldo: number;
  color?: string;
  estado: number; // 1 = activa, 0 = archivada
  fecha_creacion?: string;
  fecha_modificacion?: string;
}

export interface CreateAccountDto {
  nombre: string;
  tipo: TipoCuenta;
  saldo: number;
  color?: string;
}

export interface UpdateAccountDto {
  nombre?: string;
  tipo?: TipoCuenta;
  color?: string;
  estado?: number;
}

export interface CreateTransferDto {
  id_cuenta_origen: number;
  id_cuenta_destino: number;
  monto: number;
  fecha_transferencia: string;
  nota?: string;
}
