import { prisma } from '../../../../config/database/db';

/**
 * Repositorio para gestionar usuarios (Tabla unificada: users + suscripciones)
 */
export class UsersRepository {

  static async createUser(userData: {
    email: string;
    nombre: string;
    password_hash?: string;
    google_id?: string;
    foto_perfil?: string;
    subscription_id?: bigint;
    email_verificado?: number;
  }) {
    return await prisma.users.create({
      data: {
        ...userData,
        estado: 1,
        fecha_creacion: new Date(),
        fecha_modificacion: new Date()
      },
      include: {
        subscription: true
      }
    });
  }

  static async getAllUsers(filters?: {
    id?: bigint;
    email?: string;
    role_id?: bigint; // maps to subscription_id
    has_profile?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    if (filters?.id) {
      return await this.getUserById(filters.id);
    }
    if (filters?.email) {
      return await this.getUserByEmail(filters.email);
    }

    let whereConditions: string[] = ['u.estado = 1'];
    
    if (filters?.role_id) {
      whereConditions.push(`u.subscription_id = ${filters.role_id}`);
    }
    
    if (filters?.search) {
      const escapedSearch = filters.search.replace(/'/g, "''");
      whereConditions.push(`(LOWER(u.email) LIKE LOWER('%${escapedSearch}%') OR LOWER(u.nombre) LIKE LOWER('%${escapedSearch}%'))`);
    }
    
    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const countQuery = `
      SELECT COUNT(*) as count
      FROM users u
      ${whereClause}
    `;
    const countResult = await prisma.$queryRawUnsafe(countQuery) as any[];
    const totalCount = Number(countResult[0]?.count || 0);

    let dataQuery = `
      SELECT 
        u.id,
        u.email,
        u.email_verificado,
        u.google_id,
        u.foto_perfil as image,
        u.subscription_id as role_id,
        u.fecha_creacion as created_at,
        u.fecha_modificacion as updated_at,
        s.name as role_name,
        u.id as profile_id,
        u.nombre as name,
        '' as last_name,
        '' as phone
      FROM users u
      LEFT JOIN subscriptions s ON u.subscription_id = s.id
      ${whereClause}
      ORDER BY u.fecha_creacion DESC
    `;
    if (filters?.limit) {
      dataQuery += ` LIMIT ${filters.limit}`;
    }
    if (filters?.offset) {
      dataQuery += ` OFFSET ${filters.offset}`;
    }

    const users = await prisma.$queryRawUnsafe(dataQuery) as any[];
    return { rows: users, count: totalCount };
  }

  static async getUserById(userId: bigint) {
    const result = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.email,
        u.email_verificado,
        u.google_id,
        u.foto_perfil as image,
        u.subscription_id as role_id,
        u.fecha_creacion as created_at,
        u.fecha_modificacion as updated_at,
        s.name as role_name,
        u.id as profile_id,
        u.nombre as name,
        '' as last_name,
        '' as phone
      FROM users u
      LEFT JOIN subscriptions s ON u.subscription_id = s.id
      WHERE u.id = ${userId} AND u.estado = 1
    ` as any[];
    return result.length > 0 ? result[0] : null;
  }

  static async getUserByEmail(email: string) {
    const result = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.email,
        u.email_verificado,
        u.password_hash as password,
        u.google_id,
        u.foto_perfil as image,
        u.subscription_id as role_id,
        u.fecha_creacion as created_at,
        u.fecha_modificacion as updated_at,
        s.name as role_name,
        u.id as profile_id,
        u.nombre as name,
        '' as last_name,
        '' as phone
      FROM users u
      LEFT JOIN subscriptions s ON u.subscription_id = s.id
      WHERE u.email = ${email} AND u.estado = 1
    ` as any[];
    return result.length > 0 ? result[0] : null;
  }

  static async getUserByGoogleId(googleId: string) {
    return await prisma.users.findFirst({
      where: {
        google_id: googleId,
        estado: 1
      },
      include: {
        subscription: true
      }
    });
  }

  static async updateUser(userId: bigint, userData: {
    email?: string;
    nombre?: string;
    password_hash?: string;
    google_id?: string;
    foto_perfil?: string;
    subscription_id?: bigint;
    email_verificado?: number;
  }) {
    return await prisma.users.update({
      where: { id: userId },
      data: {
        ...userData,
        fecha_modificacion: new Date()
      },
      include: {
        subscription: true
      }
    });
  }

  static async deleteUser(userId: bigint) {
    return await prisma.users.update({
      where: { id: userId },
      data: { 
        estado: 0,
        fecha_modificacion: new Date()
      }
    });
  }

  static async userExists(userId: bigint) {
    const user = await prisma.users.findFirst({
      where: { id: userId, estado: 1 }
    });
    return !!user;
  }

  static async emailExists(email: string, excludeId?: bigint) {
    const whereClause: any = { email, estado: 1 };
    if (excludeId) {
      whereClause.id = { not: excludeId };
    }
    const user = await prisma.users.findFirst({ where: whereClause });
    return !!user;
  }

  static async getUsersByRole(roleId: bigint) {
    const users = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.email,
        u.email_verificado,
        u.google_id,
        u.foto_perfil as image,
        u.subscription_id as role_id,
        u.fecha_creacion as created_at,
        u.fecha_modificacion as updated_at,
        s.name as role_name,
        u.id as profile_id,
        u.nombre as name,
        '' as last_name,
        '' as phone
      FROM users u
      LEFT JOIN subscriptions s ON u.subscription_id = s.id
      WHERE u.subscription_id = ${roleId} AND u.estado = 1
      ORDER BY u.fecha_creacion DESC
    ` as any[];
    return users;
  }

  static async getUserStats() {
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN email_verificado = 1 THEN 1 END) as verified_users,
        COUNT(CASE WHEN email_verificado = 0 THEN 1 END) as unverified_users,
        COUNT(CASE WHEN google_id IS NOT NULL THEN 1 END) as google_users,
        COUNT(CASE WHEN password_hash IS NOT NULL THEN 1 END) as password_users,
        COUNT(DISTINCT subscription_id) as total_roles
      FROM users
      WHERE estado = 1
    ` as any[];
    return stats[0];
  }

  static async getUserDetailedStats(_userId: bigint) {
    return { work_teams_created: 0, team_memberships: 0 };
  }
}
