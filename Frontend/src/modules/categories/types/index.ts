export type TipoCategoria = 'INGRESO' | 'GASTO' | 'AMBOS';

export interface Category {
  id: number;
  nombre: string;
  tipo: TipoCategoria;
  color?: string;
  icono?: string;
  estado: number;
  fecha_creacion?: string;
  fecha_modificacion?: string;
}

export interface CreateCategoryDto {
  nombre: string;
  tipo: TipoCategoria;
  color?: string;
  icono?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  estado?: number;
}
