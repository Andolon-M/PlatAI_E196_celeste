import { CategoriesRepository } from '../../infrastructure/repositories/categories.repository';
import { TipoCategoria } from '@prisma/client';

export class CategoriesService {
  /**
   * Obtiene todas las categorías disponibles para el usuario (sistema + personalizadas)
   */
  static async getCategories(userId: bigint, tipo?: TipoCategoria) {
    return await CategoriesRepository.findAvailableCategories(userId, tipo);
  }

  /**
   * Obtiene una categoría por su ID
   */
  static async getCategoryById(id: bigint, userId: bigint) {
    const category = await CategoriesRepository.findById(id, userId);
    if (!category) {
      throw new Error('Categoría no encontrada o no tienes acceso');
    }
    return category;
  }

  /**
   * Crea una categoría personalizada para el usuario
   */
  static async createCategory(
    userId: bigint,
    data: {
      nombre: string;
      tipo: TipoCategoria;
      icono?: string;
      color?: string;
    }
  ) {
    // Validar nombre único para el usuario (sistema o personal)
    const existing = await CategoriesRepository.findByName(data.nombre, userId);
    if (existing && existing.estado === 1) {
      throw new Error('Ya existe una categoría activa con este nombre');
    }

    return await CategoriesRepository.create(userId, data);
  }

  /**
   * Actualiza una categoría personalizada
   */
  static async updateCategory(
    id: bigint,
    userId: bigint,
    data: {
      nombre?: string;
      tipo?: TipoCategoria;
      icono?: string;
      color?: string;
      estado?: number;
    }
  ) {
    const category = await CategoriesRepository.findById(id, userId);
    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    // Evitar que editen categorías globales del sistema
    if (category.id_usuario === null) {
      throw new Error('No se pueden modificar las categorías globales del sistema');
    }

    if (data.nombre && data.nombre !== category.nombre) {
      const existing = await CategoriesRepository.findByName(data.nombre, userId);
      if (existing && existing.id !== id && existing.estado === 1) {
        throw new Error('Ya existe otra categoría activa con este nombre');
      }
    }

    await CategoriesRepository.update(id, userId, data);
    return await CategoriesRepository.findById(id, userId);
  }

  /**
   * Elimina lógicamente una categoría personalizada
   */
  static async deleteCategory(id: bigint, userId: bigint) {
    const category = await CategoriesRepository.findById(id, userId);
    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    // Evitar que eliminen categorías globales
    if (category.id_usuario === null) {
      throw new Error('No se pueden eliminar las categorías globales del sistema');
    }

    await CategoriesRepository.delete(id, userId);
    return { success: true, message: 'Categoría eliminada exitosamente' };
  }
}
