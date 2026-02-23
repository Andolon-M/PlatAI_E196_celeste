import { defineConfig, env } from 'prisma/config';
import 'dotenv/config';  // Carga .env automáticamente

export default defineConfig({
  schema: './prisma/schema.prisma',  // Ruta a tu schema
  migrations: {
    seed: 'dotenv -e .env -- ts-node seeders/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
