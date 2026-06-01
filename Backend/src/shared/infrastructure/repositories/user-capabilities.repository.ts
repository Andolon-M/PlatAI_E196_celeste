import { prisma } from '../../../config/database/db';

/**
 * Interfaz para representar una capacidad de usuario
 */
export interface UserCapability {
  id: bigint;
  resource: string;
  action: string;
  type: number;
  description: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

/**
 * Interfaz para representar una suscripción de usuario
 */
export interface UserSubscription {
  id: bigint;
  name: string;
  price: number;
  created_at: Date | null;
  updated_at: Date | null;
}

/**
 * Interfaz para representar un usuario con su suscripción y capacidades
 */
export interface UserWithCapabilities {
  id: bigint;
  email: string;
  subscription: UserSubscription | null;
  capabilities: UserCapability[];
}

/**
 * Repositorio para consultar capacidades (permisos) de usuarios
 * Ubicado en la capa shared para ser usado por middlewares de autenticación
 */
export class UserCapabilitiesRepository {

  /**
   * Obtiene todas las capacidades de un usuario específico usando SQL nativo
   * Lógica: Usuario -> Suscripción -> Capacidades
   * @param userId - ID del usuario
   * @returns Lista de capacidades del usuario
   */
  static async getUserCapabilities(userId: bigint): Promise<UserCapability[]> {
    const capabilities = await prisma.$queryRaw`
      SELECT DISTINCT
        c.id,
        c.resource,
        c.action,
        c.type,
        c.description,
        c.created_at,
        c.updated_at
      FROM capabilities c
      INNER JOIN subscription_capabilities sc ON c.id = sc.capability_id
      INNER JOIN users u ON sc.subscription_id = u.subscription_id
      WHERE u.id = ${userId} 
        AND u.estado = 1
        AND u.subscription_id IS NOT NULL
      ORDER BY c.resource, c.action
    ` as UserCapability[];

    return capabilities;
  }

  /**
   * Obtiene la suscripción de un usuario específico usando SQL nativo
   * @param userId - ID del usuario
   * @returns Suscripción del usuario o null si no tiene una activa
   */
  static async getUserSubscription(userId: bigint): Promise<UserSubscription | null> {
    const result = await prisma.$queryRaw`
      SELECT 
        s.id,
        s.name,
        CAST(s.price AS DOUBLE) as price,
        s.created_at,
        s.updated_at
      FROM subscriptions s
      INNER JOIN users u ON s.id = u.subscription_id
      WHERE u.id = ${userId} 
        AND u.estado = 1
        AND u.subscription_id IS NOT NULL
    ` as UserSubscription[];

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Obtiene un usuario completo con su suscripción y capacidades
   * @param userId - ID del usuario
   * @returns Usuario con suscripción y capacidades
   */
  static async getUserWithCapabilities(userId: bigint): Promise<UserWithCapabilities | null> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true
      }
    });

    if (!user) {
      return null;
    }

    // Obtener suscripción y capacidades en paralelo
    const [subscription, capabilities] = await Promise.all([
      this.getUserSubscription(userId),
      this.getUserCapabilities(userId)
    ]);

    return {
      id: user.id,
      email: user.email,
      subscription,
      capabilities
    };
  }

  /**
   * Verifica si un usuario tiene una capacidad específica
   * Lógica: Usuario -> Suscripción -> Capacidad específica
   * @param userId - ID del usuario
   * @param resource - Recurso del permiso (ej: 'users', 'cuentas')
   * @param action - Acción del permiso (ej: 'create', 'read')
   * @param type - Tipo del permiso (opcional, por defecto 0)
   * @returns true si tiene la capacidad, false si no
   */
  static async userHasCapability(userId: bigint, resource: string, action: string, type: number = 0): Promise<boolean> {
    const result = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM capabilities c
      INNER JOIN subscription_capabilities sc ON c.id = sc.capability_id
      INNER JOIN users u ON sc.subscription_id = u.subscription_id
      WHERE u.id = ${userId} 
        AND c.resource = ${resource}
        AND c.action = ${action}
        AND c.type = ${type}
        AND u.estado = 1
        AND u.subscription_id IS NOT NULL
    ` as { count: bigint }[];

    if (!result || result.length === 0) return false;
    
    // Corrección de Bug Crítico: result es un array plano de filas devuelto por Prisma
    const count = BigInt((result[0] as any).count || 0n);
    return count > 0n;
  }

  /**
   * Verifica si un usuario tiene una suscripción específica
   * @param userId - ID del usuario
   * @param subscriptionName - Nombre de la suscripción
   * @returns true si tiene la suscripción, false si no
   */
  static async userHasSubscription(userId: bigint, subscriptionName: string): Promise<boolean> {
    const result = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM subscriptions s
      INNER JOIN users u ON s.id = u.subscription_id
      WHERE u.id = ${userId} 
        AND s.name = ${subscriptionName}
        AND u.estado = 1
        AND u.subscription_id IS NOT NULL
    ` as { count: bigint }[];

    if (!result || result.length === 0) return false;
    
    // Corrección de Bug Crítico: result es un array plano de filas devuelto por Prisma
    const count = BigInt((result[0] as any).count || 0n);
    return count > 0n;
  }

  /**
   * Asigna una suscripción a un usuario
   * @param userId - ID del usuario
   * @param subscriptionId - ID de la suscripción
   * @returns Resultado de la asignación
   */
  static async assignSubscriptionToUser(userId: bigint, subscriptionId: bigint) {
    return await prisma.users.update({
      where: { id: userId },
      data: {
        subscription_id: subscriptionId,
        fecha_modificacion: new Date()
      }
    });
  }

  /**
   * Elimina la suscripción de un usuario
   * @param userId - ID del usuario
   * @returns Resultado de la eliminación
   */
  static async removeSubscriptionFromUser(userId: bigint) {
    return await prisma.users.update({
      where: { id: userId },
      data: {
        subscription_id: null,
        fecha_modificacion: new Date()
      }
    });
  }

  /**
   * Obtiene estadísticas de capacidades de un usuario
   * @param userId - ID del usuario
   * @returns Estadísticas de suscripción del usuario
   */
  static async getUserStats(userId: bigint) {
    const [subscription, capabilities] = await Promise.all([
      this.getUserSubscription(userId),
      this.getUserCapabilities(userId)
    ]);

    return {
      has_subscription: !!subscription,
      subscription_name: subscription?.name || null,
      total_capabilities: capabilities.length,
      capabilities: capabilities.map(c => `${c.resource}.${c.action}`)
    };
  }
}
