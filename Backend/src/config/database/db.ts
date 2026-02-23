import { PrismaClient } from '@prisma/client';
import { prismaAdapter } from './prisma-adapter';

declare global {
    var prisma: PrismaClient | undefined;
}

const prisma: PrismaClient = globalThis.prisma || new PrismaClient({
    adapter: prismaAdapter,
    log: ['error', 'warn'],
    transactionOptions: {
        maxWait: 5000,
        timeout: 10000
    }
});

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma=prisma;
}

export { prisma };