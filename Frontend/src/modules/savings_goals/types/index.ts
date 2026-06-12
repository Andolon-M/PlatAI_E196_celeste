export type PrioridadMeta = 'alta' | 'media' | 'baja';
export type EstadoMeta = 'activa' | 'pausada' | 'completada';

export interface SavingsGoal {
  id: number;
  usuario_id: string;
  nombre: string;
  monto_objetivo: number;
  ahorrado: number;
  fecha_limite: string;
  prioridad: PrioridadMeta;
  estado: EstadoMeta;
  icono?: string;
  color?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface CreateSavingsGoalDto {
  nombre: string;
  monto_objetivo: number;
  fecha_limite: string;
  prioridad: PrioridadMeta;
  estado?: EstadoMeta;
  icono?: string;
  color?: string;
}

export interface UpdateSavingsGoalDto extends Partial<CreateSavingsGoalDto> {}

export interface GoalContribution {
  id: number;
  meta_id: number;
  id_cuenta: number;
  monto: number;
  fecha_aporte: string;
  nota?: string;
}

export interface CreateContributionDto {
  id_cuenta: number;
  monto: number;
  fecha_aporte: string;
  nota?: string;
}
