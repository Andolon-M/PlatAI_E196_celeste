import { Request, Response } from 'express';
import { CategoriesService } from '../services/categories.service';
import { serializeBigInt } from '../../../../shared/infrastructure/utils/bigint.utils';
import { TipoCategoria } from '@prisma/client';

export class CategoriesController {
  /**
   * Obtiene todas las categorías disponibles para el usuario
   */
  static async getCategories(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const tipo = req.query.tipo as TipoCategoria | undefined;

      const categories = await CategoriesService.getCategories(userId, tipo);

      return res.status(200).json({
        status: 200,
        message: 'Categorías obtenidas correctamente',
        data: serializeBigInt(categories)
      });
    } catch (error) {
      console.error('Error en getCategories controller:', error);
      return res.status(500).json({
        status: 500,
        message: 'Error al obtener las categorías',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene una categoría por su ID
   */
  static async getCategoryById(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const id = BigInt(req.params.id);

      const category = await CategoriesService.getCategoryById(id, userId);

      return res.status(200).json({
        status: 200,
        message: 'Categoría obtenida correctamente',
        data: serializeBigInt(category)
      });
    } catch (error) {
      console.error('Error en getCategoryById controller:', error);
      return res.status(error instanceof Error && error.message.includes('no encontrada') ? 404 : 500).json({
        status: error instanceof Error && error.message.includes('no encontrada') ? 404 : 500,
        message: 'Error al obtener la categoría',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Crea una categoría personalizada para el usuario
   */
  static async createCategory(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const data = req.body;

      const category = await CategoriesService.createCategory(userId, data);

      return res.status(201).json({
        status: 201,
        message: 'Categoría personalizada creada exitosamente',
        data: serializeBigInt(category)
      });
    } catch (error) {
      console.error('Error en createCategory controller:', error);
      return res.status(400).json({
        status: 400,
        message: 'Error al crear la categoría',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Actualiza una categoría personalizada
   */
  static async updateCategory(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const id = BigInt(req.params.id);
      const data = req.body;

      const category = await CategoriesService.updateCategory(id, userId, data);

      return res.status(200).json({
        status: 200,
        message: 'Categoría actualizada exitosamente',
        data: serializeBigInt(category)
      });
    } catch (error) {
      console.error('Error en updateCategory controller:', error);
      const isForbidden = error instanceof Error && error.message.includes('sistema');
      const isNotFound = error instanceof Error && error.message.includes('no encontrada');
      const statusCode = isForbidden ? 403 : isNotFound ? 404 : 400;

      return res.status(statusCode).json({
        status: statusCode,
        message: 'Error al actualizar la categoría',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Elimina lógicamente una categoría personalizada
   */
  static async deleteCategory(req: Request, res: Response) {
    try {
      const userId = BigInt(req.user!.userId);
      const id = BigInt(req.params.id);

      const result = await CategoriesService.deleteCategory(id, userId);

      return res.status(200).json({
        status: 200,
        message: result.message
      });
    } catch (error) {
      console.error('Error en deleteCategory controller:', error);
      const isForbidden = error instanceof Error && error.message.includes('sistema');
      const isNotFound = error instanceof Error && error.message.includes('no encontrada');
      const statusCode = isForbidden ? 403 : isNotFound ? 404 : 400;

      return res.status(statusCode).json({
        status: statusCode,
        message: 'Error al eliminar la categoría',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}
