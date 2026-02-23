import { prisma } from '../../../../config/database/db'
import { Prisma } from '@prisma/client';
import { User, UserFactory } from '../../domain/auth'

export class AuthRepository {
    static async findUserByEmail(email: string): Promise<User | null> {
        try {
            const user = await prisma.users.findFirst({ 
                where: { 
                    email,
                    deleted_at: null
                },
                include: {
                    user_profiles: true
                }
            });
            
            return user ? UserFactory.fromPrisma(user) : null;
        } catch (error) {
            console.error('Error al buscar usuario por email:', error);
            return null;
        }
    }

    static async createUser(newUser: Prisma.usersCreateInput): Promise<User | Error> {
        try {
            const user = await prisma.users.create({ 
                data: newUser,
                include: {
                    user_profiles: true
                }
            });
            
            return UserFactory.fromPrisma(user);
        } catch (error) {
            console.error('Error creando usuario:', error);
            throw new Error('Error creando usuario: ' + (error as Error).message);
        }
    }

    /**
     * Busca un usuario por su ID
     * @param userId - ID del usuario a buscar
     * @returns Usuario encontrado o null
     */
    static async findUserById(userId: bigint) {
        try {
            const user = await prisma.users.findUnique({
                where: {
                    id: userId
                },
                include: {
                    user_profiles: true
                }
            });
            
            return user ? UserFactory.fromPrisma(user) : null;
        } catch (error) {
            console.error('Error al buscar usuario por ID:', error);
            return null;
        }
    }

    /**
     * Actualiza la contraseña de un usuario
     * @param userId - ID del usuario
     * @param hashedPassword - Nueva contraseña hasheada
     * @returns Usuario actualizado
     */
    static async updateUserPassword(userId: bigint, hashedPassword: string) {
        try {
            const user = await prisma.users.update({
                where: {
                    id: userId
                },
                data: {
                    password: hashedPassword,
                    updated_at: new Date()
                },
                include: {
                    user_profiles: true
                }
            });
            
            return UserFactory.fromPrisma(user);
        } catch (error) {
            console.error('Error al actualizar contraseña:', error);
            throw new Error('Error al actualizar contraseña: ' + (error as Error).message);
        }
    }

    /**
     * Guarda o actualiza tokens OAuth para un usuario y proveedor (ej. Google).
     * Un usuario solo puede tener un registro por proveedor.
     */
    static async upsertUserOAuthTokens(
        userId: bigint,
        provider: string,
        data: { access_token: string; refresh_token?: string | null; expires_at?: Date | null }
    ) {
        await prisma.user_oauth_tokens.upsert({
            where: {
                user_id_provider: { user_id: userId, provider }
            },
            create: {
                user_id: userId,
                provider,
                access_token: data.access_token,
                refresh_token: data.refresh_token ?? null,
                expires_at: data.expires_at ?? null
            },
            update: {
                access_token: data.access_token,
                refresh_token: data.refresh_token ?? undefined,
                expires_at: data.expires_at ?? undefined,
                updated_at: new Date()
            }
        });
    }
}
