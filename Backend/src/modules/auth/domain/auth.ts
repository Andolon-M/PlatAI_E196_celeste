import { users, user_profiles } from '@prisma/client';

export type User = users & {
    registerComplete?: boolean;
    user_profiles?: user_profiles | null;
};

export const UserFactory = {
    /**
     * Crea una instancia User desde un objeto de Prisma
     * @param prismaUser El objeto usuario de Prisma
     * @returns Un objeto User con propiedades extendidas
     */
    fromPrisma(prismaUser: any): User {
        return {
            ...prismaUser,
            registerComplete: false
        };
    }
};
