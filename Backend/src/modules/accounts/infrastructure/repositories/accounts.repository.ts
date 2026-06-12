import { prisma } from '../../../../config/database/db';
import { Prisma, TipoCuenta } from '@prisma/client';

export class AccountsRepository {
  /**
   * Obtiene todas las cuentas de un usuario específico
   */
  static async findManyByUserId(userId: bigint, filters?: { estado?: number }) {
    return await prisma.cuentas.findMany({
      where: {
        id_usuario: userId,
        ...(filters?.estado !== undefined ? { estado: filters.estado } : {})
      },
      orderBy: {
        fecha_creacion: 'desc'
      }
    });
  }

  /**
   * Obtiene una cuenta por su ID y ID de usuario
   */
  static async findById(id: bigint, userId: bigint) {
    return await prisma.cuentas.findFirst({
      where: {
        id: id,
        id_usuario: userId
      }
    });
  }

  /**
   * Verifica si ya existe una cuenta con el mismo nombre para el usuario
   */
  static async findByName(nombre: string, userId: bigint) {
    return await prisma.cuentas.findFirst({
      where: {
        nombre: {
          equals: nombre
        },
        id_usuario: userId
      }
    });
  }

  /**
   * Crea una nueva cuenta para un usuario
   */
  static async create(userId: bigint, data: {
    nombre: string;
    tipo: TipoCuenta;
    saldo?: number | Prisma.Decimal;
    color?: string;
  }) {
    return await prisma.cuentas.create({
      data: {
        id_usuario: userId,
        nombre: data.nombre,
        tipo: data.tipo,
        saldo: data.saldo ?? 0.00,
        color: data.color ?? null,
        estado: 1,
        fecha_creacion: new Date(),
        fecha_modificacion: new Date()
      }
    });
  }

  /**
   * Actualiza los datos de una cuenta
   */
  static async update(
    id: bigint,
    userId: bigint,
    data: {
      nombre?: string;
      tipo?: TipoCuenta;
      color?: string;
      estado?: number;
    }
  ) {
    return await prisma.cuentas.updateMany({
      where: {
        id: id,
        id_usuario: userId
      },
      data: {
        ...(data.nombre ? { nombre: data.nombre } : {}),
        ...(data.tipo ? { tipo: data.tipo } : {}),
        ...(data.color ? { color: data.color } : {}),
        ...(data.estado !== undefined ? { estado: data.estado } : {}),
        fecha_modificacion: new Date()
      }
    });
  }

  /**
   * Actualiza el saldo de una cuenta sumando o restando un monto.
   * Soporta recibir la instancia de transacción de Prisma `tx`.
   */
  static async updateBalance(
    id: bigint,
    amountChange: number | Prisma.Decimal,
    tx?: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
  ) {
    const client = tx || prisma;
    return await client.cuentas.update({
      where: { id: id },
      data: {
        saldo: {
          increment: amountChange
        },
        fecha_modificacion: new Date()
      }
    });
  }
}
