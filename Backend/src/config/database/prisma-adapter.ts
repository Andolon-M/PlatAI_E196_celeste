import { PrismaMariaDb } from '@prisma/adapter-mariadb';

function createPrismaMariaDbAdapter() {
  const rawDatabaseUrl = process.env.DATABASE_URL?.trim();

  if (!rawDatabaseUrl) {
    throw new Error('DATABASE_URL no está configurada');
  }

  const parsedUrl = new URL(rawDatabaseUrl);

  return new PrismaMariaDb({
    host: parsedUrl.hostname,
    port: Number(parsedUrl.port || '3306'),
    user: decodeURIComponent(parsedUrl.username),
    password: decodeURIComponent(parsedUrl.password),
    database: parsedUrl.pathname.replace(/^\//, ''),
    connectionLimit: 5,
  });
}

export const prismaAdapter = createPrismaMariaDbAdapter();
