import { prisma } from '../../../../config/database/db';
import { TipoCategoria } from '@prisma/client';

export class CategoriesRepository {
  /**
   * Obtiene las categorías disponibles para un usuario (sistema + personalizadas)
   */
  static async findAvailableCategories(userId: bigint, tipo?: TipoCategoria) {
    return await prisma.categorias.findMany({
      where: {
        OR: [
          { id_usuario: null }, // Categorías del sistema
          { id_usuario: userId } // Categorías del usuario
        ],
        estado: 1, // Solo activas
        ...(tipo ? { tipo: { in: [tipo, TipoCategoria.ambos] } } : {})
      },
      orderBy: {
        nombre: 'asc'
      }
    });
  }

  /**
   * Obtiene una categoría por su ID, asegurando que sea del sistema o propiedad del usuario
   */
  static async findById(id: bigint, userId: bigint) {
    return await prisma.categorias.findFirst({
      where: {
        id: id,
        OR: [
          { id_usuario: null },
          { id_usuario: userId }
        ]
      }
    });
  }

  /**
   * Verifica si ya existe una categoría con el mismo nombre para el usuario o del sistema
   */
  static async findByName(nombre: string, userId: bigint) {
    return await prisma.categorias.findFirst({
      where: {
        nombre: {
          equals: nombre
        },
        OR: [
          { id_usuario: null },
          { id_usuario: userId }
        ]
      }
    });
  }

  /**
   * Crea una categoría personalizada para el usuario
   */
  static async create(userId: bigint, data: {
    nombre: string;
    tipo: TipoCategoria;
    icono?: string;
    color?: string;
  }) {
    return await prisma.categorias.create({
      data: {
        id_usuario: userId,
        nombre: data.nombre,
        tipo: data.tipo,
        icono: data.icono ?? null,
        color: data.color ?? null,
        estado: 1,
        fecha_creacion: new Date(),
        fecha_modificacion: new Date()
      }
    });
  }

  /**
   * Actualiza una categoría personalizada (solo si pertenece al usuario)
   */
  static async update(
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
    return await prisma.categorias.updateMany({
      where: {
        id: id,
        id_usuario: userId // Solo puede editar las suyas
      },
      data: {
        ...(data.nombre ? { nombre: data.nombre } : {}),
        ...(data.tipo ? { tipo: data.tipo } : {}),
        ...(data.icono ? { icono: data.icono } : {}),
        ...(data.color ? { color: data.color } : {}),
        ...(data.estado !== undefined ? { estado: data.estado } : {}),
        fecha_modificacion: new Date()
      }
    });
  }

  /**
   * Elimina lógicamente una categoría personalizada (estado: 0)
   */
  static async delete(id: bigint, userId: bigint) {
    return await prisma.categorias.updateMany({
      where: {
        id: id,
        id_usuario: userId // Solo puede eliminar las suyas
      },
      data: {
        estado: 0,
        fecha_modificacion: new Date()
      }
    });
  }
}
