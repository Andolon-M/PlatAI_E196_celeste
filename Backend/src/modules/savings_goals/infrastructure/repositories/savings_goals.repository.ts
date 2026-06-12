import { prisma } from '../../../../config/database/db';
import { Prisma, PrioridadMeta, EstadoMeta } from '@prisma/client';

export class SavingsGoalsRepository {
  /**
   * Obtiene todas las metas de ahorro de un usuario específico
   */
  static async findManyGoals(userId: bigint, filters?: { estado?: EstadoMeta }) {
    return await prisma.metas_ahorro.findMany({
      where: {
        id_usuario: userId,
        ...(filters?.estado ? { estado: filters.estado } : {})
      },
      orderBy: {
        fecha_creacion: 'desc'
      }
    });
  }

  /**
   * Obtiene una meta de ahorro por su ID y ID de usuario
   */
  static async findGoalById(id: bigint, userId: bigint) {
    return await prisma.metas_ahorro.findFirst({
      where: {
        id: id,
        id_usuario: userId
      },
      include: {
        aportes: true
      }
    });
  }

  /**
   * Verifica si ya existe una meta con el mismo nombre para el usuario
   */
  static async findGoalByName(nombre: string, userId: bigint) {
    return await prisma.metas_ahorro.findFirst({
      where: {
        nombre: {
          equals: nombre
        },
        id_usuario: userId
      }
    });
  }

  /**
   * Crea una nueva meta de ahorro
   */
  static async createGoal(userId: bigint, data: {
    nombre: string;
    monto_objetivo: number | Prisma.Decimal;
    fecha_limite: Date;
    prioridad: PrioridadMeta;
    estado?: EstadoMeta;
    icono?: string;
    color?: string;
  }) {
    return await prisma.metas_ahorro.create({
      data: {
        id_usuario: userId,
        nombre: data.nombre,
        monto_objetivo: data.monto_objetivo,
        monto_actual: 0.00,
        fecha_limite: data.fecha_limite,
        prioridad: data.prioridad,
        estado: data.estado ?? EstadoMeta.activa,
        icono: data.icono ?? null,
        color: data.color ?? null,
        fecha_creacion: new Date(),
        fecha_modificacion: new Date()
      }
    });
  }

  /**
   * Actualiza los datos de una meta de ahorro
   */
  static async updateGoal(
    id: bigint,
    userId: bigint,
    data: {
      nombre?: string;
      monto_objetivo?: number | Prisma.Decimal;
      monto_actual?: number | Prisma.Decimal;
      fecha_limite?: Date;
      prioridad?: PrioridadMeta;
      estado?: EstadoMeta;
      icono?: string;
      color?: string;
    },
    tx?: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
  ) {
    const client = tx || prisma;
    return await client.metas_ahorro.updateMany({
      where: {
        id: id,
        id_usuario: userId
      },
      data: {
        ...(data.nombre ? { nombre: data.nombre } : {}),
        ...(data.monto_objetivo !== undefined ? { monto_objetivo: data.monto_objetivo } : {}),
        ...(data.monto_actual !== undefined ? { monto_actual: data.monto_actual } : {}),
        ...(data.fecha_limite ? { fecha_limite: data.fecha_limite } : {}),
        ...(data.prioridad ? { prioridad: data.prioridad } : {}),
        ...(data.estado ? { estado: data.estado } : {}),
        ...(data.icono !== undefined ? { icono: data.icono } : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
        fecha_modificacion: new Date()
      }
    });
  }

  /**
   * Elimina físicamente una meta de ahorro (Prisma hace cascade delete en aportes)
   */
  static async deleteGoal(id: bigint, userId: bigint) {
    return await prisma.metas_ahorro.deleteMany({
      where: {
        id: id,
        id_usuario: userId
      }
    });
  }

  /**
   * Obtiene todos los aportes de una meta
   */
  static async findContributionsByGoalId(metaId: bigint, userId: bigint) {
    return await prisma.aportes_meta.findMany({
      where: {
        id_meta: metaId,
        id_usuario: userId
      },
      orderBy: {
        fecha_aporte: 'desc'
      }
    });
  }

  /**
   * Obtiene un aporte específico
   */
  static async findContributionById(id: bigint, userId: bigint) {
    return await prisma.aportes_meta.findFirst({
      where: {
        id: id,
        id_usuario: userId
      }
    });
  }

  /**
   * Crea un nuevo aporte en una transacción
   */
  static async createContribution(
    userId: bigint,
    metaId: bigint,
    data: {
      id_cuenta: bigint;
      monto: number | Prisma.Decimal;
      nota?: string;
      fecha_aporte: Date;
    },
    tx: Prisma.TransactionClient
  ) {
    return await tx.aportes_meta.create({
      data: {
        id_meta: metaId,
        id_usuario: userId,
        id_cuenta: data.id_cuenta,
        monto: data.monto,
        nota: data.nota ?? null,
        fecha_aporte: data.fecha_aporte,
        fecha_creacion: new Date()
      }
    });
  }

  /**
   * Elimina un aporte en una transacción
   */
  static async deleteContribution(
    id: bigint,
    tx: Prisma.TransactionClient
  ) {
    return await tx.aportes_meta.delete({
      where: { id: id }
    });
  }
}
