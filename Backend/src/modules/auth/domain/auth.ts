import { users } from '@prisma/client';

export type User = users & {
    registerComplete?: boolean;
    user_profiles?: {
        name: string | null;
        last_name: string | null;
        phone: string | null;
    } | null;
};

export const UserFactory = {
    /**
     * Crea una instancia User desde un objeto de Prisma
     * @param prismaUser El objeto usuario de Prisma
     * @returns Un objeto User con propiedades extendidas y compatibilidad con perfiles antiguos
     */
    fromPrisma(prismaUser: any): User {
        if (!prismaUser) return prismaUser;
        
        return {
            ...prismaUser,
            registerComplete: false,
            // Simular el perfil unificado para mantener la compatibilidad con el código cliente
            user_profiles: {
                name: prismaUser.nombre,
                last_name: '',
                phone: ''
            }
        };
    }
};
