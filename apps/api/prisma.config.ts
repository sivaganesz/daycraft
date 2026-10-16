import { defineConfig } from 'prisma/config';
import { loadEnvFile } from './src/config/env';

loadEnvFile();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Needed by migrate commands only; `prisma generate` works without a database.
    url: process.env.DATABASE_URL ?? '',
  },
});
