import { prisma } from '../../../../config/database/db';
import { Prisma, TipoDeuda, EstadoDeuda } from '@prisma/client';

export class DebtsRepository {
  /**
   * Obtiene todas las deudas/préstamos de un usuario con filtros opcionales
   */
  static async findManyDebts(userId: bigint, filters?: { tipo?: TipoDeuda; estado?: EstadoDeuda }) {
    return await prisma.deudas_prestamos.findMany({
      where: {
        id_usuario: userId,
        ...(filters?.tipo ? { tipo: filters.tipo } : {}),
        ...(filters?.estado ? { estado: filters.estado } : {})
      },
      include: {
        abonos: true
      },
      orderBy: {
        fecha_creacion: 'desc'
      }
    });
  }

  /**
   * Obtiene una deuda por su ID y ID de usuario
   */
  static async findDebtById(id: bigint, userId: bigint) {
    return await prisma.deudas_prestamos.findFirst({
      where: {
        id: id,
        id_usuario: userId
      },
      include: {
        abonos: {
          orderBy: {
            fecha_abono: 'desc'
          }
        }
      }
    });
  }

  /**
   * Crea una nueva deuda/préstamo
   */
  static async createDebt(userId: bigint, data: {
    tipo: TipoDeuda;
    persona_entidad: string;
    monto_total: number | Prisma.Decimal;
    descripcion?: string;
    fecha_vencimiento?: Date;
    estado?: EstadoDeuda;
  }) {
    return await prisma.deudas_prestamos.create({
      data: {
        id_usuario: userId,
        tipo: data.tipo,
        persona_entidad: data.persona_entidad,
        monto_total: data.monto_total,
        descripcion: data.descripcion ?? null,
        fecha_vencimiento: data.fecha_vencimiento ?? null,
        estado: data.estado ?? EstadoDeuda.pendiente,
        fecha_creacion: new Date(),
        fecha_modificacion: new Date()
      }
    });
  }

  /**
   * Actualiza los datos de una deuda/préstamo
   */
  static async updateDebt(
    id: bigint,
    userId: bigint,
    data: {
      tipo?: TipoDeuda;
      persona_entidad?: string;
      monto_total?: number | Prisma.Decimal;
      descripcion?: string;
      fecha_vencimiento?: Date;
      estado?: EstadoDeuda;
    }
  ) {
    return await prisma.deudas_prestamos.updateMany({
      where: {
        id: id,
        id_usuario: userId
      },
      data: {
        ...(data.tipo ? { tipo: data.tipo } : {}),
        ...(data.persona_entidad ? { persona_entidad: data.persona_entidad } : {}),
        ...(data.monto_total !== undefined ? { monto_total: data.monto_total } : {}),
        ...(data.descripcion !== undefined ? { descripcion: data.descripcion } : {}),
        ...(data.fecha_vencimiento !== undefined ? { fecha_vencimiento: data.fecha_vencimiento } : {}),
        ...(data.estado ? { estado: data.estado } : {}),
        fecha_modificacion: new Date()
      }
    });
  }

  /**
   * Elimina una deuda/préstamo
   */
  static async deleteDebt(id: bigint, userId: bigint) {
    return await prisma.deudas_prestamos.deleteMany({
      where: {
        id: id,
        id_usuario: userId
      }
    });
  }

  /**
   * Obtiene todos los abonos de una deuda
   */
  static async findPaymentsByDebtId(debtId: bigint, userId: bigint) {
    return await prisma.abonos_deuda.findMany({
      where: {
        id_deuda: debtId,
        id_usuario: userId
      },
      orderBy: {
        fecha_abono: 'desc'
      }
    });
  }

  /**
   * Obtiene un abono específico
   */
  static async findPaymentById(id: bigint, userId: bigint) {
    return await prisma.abonos_deuda.findFirst({
      where: {
        id: id,
        id_usuario: userId
      }
    });
  }

  /**
   * Crea un nuevo abono dentro de una transacción
   */
  static async createPayment(
    userId: bigint,
    debtId: bigint,
    data: {
      monto_abonado: number | Prisma.Decimal;
      nota?: string;
      fecha_abono: Date;
    },
    tx: Prisma.TransactionClient
  ) {
    return await tx.abonos_deuda.create({
      data: {
        id_deuda: debtId,
        id_usuario: userId,
        monto_abonado: data.monto_abonado,
        nota: data.nota ?? null,
        fecha_abono: data.fecha_abono,
        fecha_creacion: new Date()
      }
    });
  }

  /**
   * Elimina un abono dentro de una transacción
   */
  static async deletePayment(id: bigint, tx: Prisma.TransactionClient) {
    return await tx.abonos_deuda.delete({
      where: { id: id }
    });
  }

  /**
   * Calcula la suma total de abonos para una deuda
   */
  static async sumPaymentsByDebtId(debtId: bigint) {
    const result = await prisma.abonos_deuda.aggregate({
      where: {
        id_deuda: debtId
      },
      _sum: {
        monto_abonado: true
      }
    });
    return Number(result._sum.monto_abonado ?? 0);
  }

  /**
   * Cuenta la cantidad de abonos de una deuda
   */
  static async countPaymentsByDebtId(debtId: bigint) {
    return await prisma.abonos_deuda.count({
      where: {
        id_deuda: debtId
      }
    });
  }
}
