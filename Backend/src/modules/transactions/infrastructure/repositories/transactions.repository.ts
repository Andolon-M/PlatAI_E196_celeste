import { prisma } from '../../../../config/database/db';
import { Prisma, TipoMovimiento, MetodoPago } from '@prisma/client';

export class TransactionsRepository {
  /**
   * Obtiene todos los movimientos no eliminados de un usuario con filtros y paginación
   */
  static async findMany(
    userId: bigint,
    filters?: {
      id_cuenta?: bigint;
      id_categoria?: bigint;
      tipo?: TipoMovimiento;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    },
    pagination?: {
      page?: number;
      pageSize?: number;
    }
  ) {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const whereClause: Prisma.movimientosWhereInput = {
      id_usuario: userId,
      eliminado: 0, // Solo no eliminados
      ...(filters?.id_cuenta ? { id_cuenta: filters.id_cuenta } : {}),
      ...(filters?.id_categoria ? { id_categoria: filters.id_categoria } : {}),
      ...(filters?.tipo ? { tipo: filters.tipo } : {}),
      ...((filters?.startDate || filters?.endDate)
        ? {
            fecha: {
              ...(filters.startDate ? { gte: filters.startDate } : {}),
              ...(filters.endDate ? { lte: filters.endDate } : {})
            }
          }
        : {}),
      ...(filters?.search
        ? {
            OR: [
              { descripcion: { contains: filters.search } },
              { nota: { contains: filters.search } }
            ]
          }
        : {})
    };

    const [total, items] = await Promise.all([
      prisma.movimientos.count({ where: whereClause }),
      prisma.movimientos.findMany({
        where: whereClause,
        orderBy: {
          fecha: 'desc'
        },
        skip,
        take: pageSize,
        include: {
          cuenta: {
            select: {
              id: true,
              nombre: true,
              tipo: true
            }
          },
          categoria: {
            select: {
              id: true,
              nombre: true,
              icono: true,
              color: true
            }
          }
        }
      })
    ]);

    return {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      items
    };
  }

  /**
   * Obtiene un movimiento específico por su ID y ID de usuario
   */
  static async findById(id: bigint, userId: bigint) {
    return await prisma.movimientos.findFirst({
      where: {
        id: id,
        id_usuario: userId,
        eliminado: 0
      },
      include: {
        cuenta: true,
        categoria: true
      }
    });
  }

  /**
   * Inserta un nuevo movimiento dentro del contexto de una transacción de Prisma
   */
  static async createMovement(
    userId: bigint,
    data: {
      id_cuenta: bigint;
      id_categoria: bigint;
      tipo: TipoMovimiento;
      monto: number | Prisma.Decimal;
      descripcion: string;
      fecha: Date;
      metodo_pago: MetodoPago;
      nota?: string;
      origen_ia?: number;
    },
    tx?: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
  ) {
    const client = tx || prisma;
    return await client.movimientos.create({
      data: {
        id_usuario: userId,
        id_cuenta: data.id_cuenta,
        id_categoria: data.id_categoria,
        tipo: data.tipo,
        monto: data.monto,
        descripcion: data.descripcion,
        fecha: data.fecha,
        metodo_pago: data.metodo_pago,
        nota: data.nota ?? null,
        origen_ia: data.origen_ia ?? 0,
        eliminado: 0,
        fecha_creacion: new Date(),
        fecha_modificacion: new Date()
      }
    });
  }

  /**
   * Actualiza los datos de un movimiento dentro de una transacción
   */
  static async updateMovement(
    id: bigint,
    userId: bigint,
    data: {
      id_cuenta?: bigint;
      id_categoria?: bigint;
      tipo?: TipoMovimiento;
      monto?: number | Prisma.Decimal;
      descripcion?: string;
      fecha?: Date;
      metodo_pago?: MetodoPago;
      nota?: string;
      origen_ia?: number;
    },
    tx?: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
  ) {
    const client = tx || prisma;
    return await client.movimientos.update({
      where: {
        id: id
      },
      data: {
        ...(data.id_cuenta ? { id_cuenta: data.id_cuenta } : {}),
        ...(data.id_categoria ? { id_categoria: data.id_categoria } : {}),
        ...(data.tipo ? { tipo: data.tipo } : {}),
        ...(data.monto !== undefined ? { monto: data.monto } : {}),
        ...(data.descripcion ? { descripcion: data.descripcion } : {}),
        ...(data.fecha ? { fecha: data.fecha } : {}),
        ...(data.metodo_pago ? { metodo_pago: data.metodo_pago } : {}),
        ...(data.nota !== undefined ? { nota: data.nota } : {}),
        ...(data.origen_ia !== undefined ? { origen_ia: data.origen_ia } : {}),
        fecha_modificacion: new Date()
      }
    });
  }

  /**
   * Realiza Soft Delete del movimiento dentro de una transacción (eliminado: 1)
   */
  static async deleteMovement(
    id: bigint,
    tx?: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
  ) {
    const client = tx || prisma;
    return await client.movimientos.update({
      where: {
        id: id
      },
      data: {
        eliminado: 1,
        fecha_modificacion: new Date()
      }
    });
  }

  /**
   * Crea un registro de transferencia dentro de una transacción de Prisma
   */
  static async createTransfer(
    userId: bigint,
    data: {
      id_cuenta_origen: bigint;
      id_cuenta_destino: bigint;
      monto: number | Prisma.Decimal;
      nota?: string;
      fecha_transferencia: Date;
    },
    tx?: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
  ) {
    const client = tx || prisma;
    return await client.transferencias.create({
      data: {
        id_usuario: userId,
        id_cuenta_origen: data.id_cuenta_origen,
        id_cuenta_destino: data.id_cuenta_destino,
        monto: data.monto,
        nota: data.nota ?? null,
        fecha_transferencia: data.fecha_transferencia,
        fecha_creacion: new Date()
      }
    });
  }

  /**
   * Obtiene las transferencias realizadas por el usuario
   */
  static async findTransfers(
    userId: bigint,
    filters?: {
      id_cuenta_origen?: bigint;
      id_cuenta_destino?: bigint;
      startDate?: Date;
      endDate?: Date;
    },
    pagination?: {
      page?: number;
      pageSize?: number;
    }
  ) {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const whereClause: Prisma.transferenciasWhereInput = {
      id_usuario: userId,
      ...(filters?.id_cuenta_origen ? { id_cuenta_origen: filters.id_cuenta_origen } : {}),
      ...(filters?.id_cuenta_destino ? { id_cuenta_destino: filters.id_cuenta_destino } : {}),
      ...((filters?.startDate || filters?.endDate)
        ? {
            fecha_transferencia: {
              ...(filters.startDate ? { gte: filters.startDate } : {}),
              ...(filters.endDate ? { lte: filters.endDate } : {})
            }
          }
        : {})
    };

    const [total, items] = await Promise.all([
      prisma.transferencias.count({ where: whereClause }),
      prisma.transferencias.findMany({
        where: whereClause,
        orderBy: {
          fecha_transferencia: 'desc'
        },
        skip,
        take: pageSize,
        include: {
          cuenta_origen: {
            select: {
              id: true,
              nombre: true,
              tipo: true
            }
          },
          cuenta_destino: {
            select: {
              id: true,
              nombre: true,
              tipo: true
            }
          }
        }
      })
    ]);

    return {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      items
    };
  }
}
