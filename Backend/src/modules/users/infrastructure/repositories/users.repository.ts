import { prisma } from '../../../../config/database/db';

/**
 * Repositorio para gestionar usuarios (plantilla: users + user_profiles)
 */
export class UsersRepository {

  static async createUser(userData: {
    email: string;
    password?: string;
    google_id?: string;
    image?: string;
    role_id?: bigint;
    email_verified_at?: Date;
  }) {
    return await prisma.users.create({
      data: {
        ...userData,
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        role: true,
        user_profiles: true
      }
    });
  }

  static async getAllUsers(filters?: {
    id?: bigint;
    email?: string;
    role_id?: bigint;
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

    let whereConditions: string[] = ['u.deleted_at IS NULL'];
    if (filters?.role_id) {
      whereConditions.push(`u.role_id = ${filters.role_id}`);
    }
    if (filters?.has_profile !== undefined) {
      if (filters.has_profile) {
        whereConditions.push('up.id IS NOT NULL');
      } else {
        whereConditions.push('up.id IS NULL');
      }
    }
    if (filters?.search) {
      whereConditions.push(`(LOWER(u.email) LIKE LOWER('%${filters.search}%') OR LOWER(up.name) LIKE LOWER('%${filters.search}%') OR LOWER(up.last_name) LIKE LOWER('%${filters.search}%'))`);
    }
    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as count
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id AND up.deleted_at IS NULL
      ${whereClause}
    `;
    const countResult = await prisma.$queryRawUnsafe(countQuery) as any[];
    const totalCount = Number(countResult[0]?.count || 0);

    let dataQuery = `
      SELECT 
        u.id,
        u.email,
        u.email_verified_at,
        u.google_id,
        u.image,
        u.role_id,
        u.created_at,
        u.updated_at,
        r.name as role_name,
        up.id as profile_id,
        up.name as name,
        up.last_name as last_name,
        up.phone as phone
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id AND r.deleted_at IS NULL
      LEFT JOIN user_profiles up ON u.id = up.user_id AND up.deleted_at IS NULL
      ${whereClause}
      ORDER BY u.created_at DESC
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
        u.email_verified_at,
        u.google_id,
        u.image,
        u.role_id,
        u.created_at,
        u.updated_at,
        r.name as role_name,
        up.id as profile_id,
        up.name as name,
        up.last_name as last_name,
        up.phone as phone
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id AND r.deleted_at IS NULL
      LEFT JOIN user_profiles up ON u.id = up.user_id AND up.deleted_at IS NULL
      WHERE u.id = ${userId} AND u.deleted_at IS NULL
    ` as any[];
    return result.length > 0 ? result[0] : null;
  }

  static async getUserByEmail(email: string) {
    const result = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.email,
        u.email_verified_at,
        u.password,
        u.google_id,
        u.image,
        u.role_id,
        u.created_at,
        u.updated_at,
        r.name as role_name,
        up.id as profile_id,
        up.name as name,
        up.last_name as last_name,
        up.phone as phone
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id AND r.deleted_at IS NULL
      LEFT JOIN user_profiles up ON u.id = up.user_id AND up.deleted_at IS NULL
      WHERE u.email = ${email} AND u.deleted_at IS NULL
    ` as any[];
    return result.length > 0 ? result[0] : null;
  }

  static async getUserByGoogleId(googleId: string) {
    return await prisma.users.findFirst({
      where: {
        google_id: googleId,
        deleted_at: null
      },
      include: {
        role: true,
        user_profiles: true
      }
    });
  }

  static async updateUser(userId: bigint, userData: {
    email?: string;
    password?: string;
    google_id?: string;
    image?: string;
    role_id?: bigint;
    email_verified_at?: Date;
  }) {
    return await prisma.users.update({
      where: { id: userId },
      data: {
        ...userData,
        updated_at: new Date()
      },
      include: {
        role: true,
        user_profiles: true
      }
    });
  }

  static async deleteUser(userId: bigint) {
    return await prisma.users.update({
      where: { id: userId },
      data: { deleted_at: new Date() }
    });
  }

  static async userExists(userId: bigint) {
    const user = await prisma.users.findFirst({
      where: { id: userId, deleted_at: null }
    });
    return !!user;
  }

  static async emailExists(email: string, excludeId?: bigint) {
    const whereClause: any = { email, deleted_at: null };
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
        u.email_verified_at,
        u.google_id,
        u.image,
        u.role_id,
        u.created_at,
        u.updated_at,
        r.name as role_name,
        up.id as profile_id,
        up.name as name,
        up.last_name as last_name,
        up.phone as phone
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id AND r.deleted_at IS NULL
      LEFT JOIN user_profiles up ON u.id = up.user_id AND up.deleted_at IS NULL
      WHERE u.role_id = ${roleId} AND u.deleted_at IS NULL
      ORDER BY u.created_at DESC
    ` as any[];
    return users;
  }

  static async getUserStats() {
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN email_verified_at IS NOT NULL THEN 1 END) as verified_users,
        COUNT(CASE WHEN email_verified_at IS NULL THEN 1 END) as unverified_users,
        COUNT(CASE WHEN google_id IS NOT NULL THEN 1 END) as google_users,
        COUNT(CASE WHEN password IS NOT NULL THEN 1 END) as password_users,
        COUNT(DISTINCT role_id) as total_roles
      FROM users
      WHERE deleted_at IS NULL
    ` as any[];
    return stats[0];
  }

  static async getUserDetailedStats(_userId: bigint) {
    return { work_teams_created: 0, team_memberships: 0 };
  }
}
