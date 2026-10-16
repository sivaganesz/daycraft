import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

// Self-contained on purpose: the small migration image (infra/migrate) ships this file
// without the API source code. Real environment variables take precedence over `.env`.
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

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
