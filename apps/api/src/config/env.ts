import { existsSync } from 'node:fs';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  WEB_ORIGIN: z.url(),
  /** Set to the git commit SHA by the deploy pipeline. */
  APP_VERSION: z.string().min(1).default('dev'),
});

export type Env = z.infer<typeof envSchema>;

/** Injection token for the validated environment. */
export const ENV = Symbol('ENV');

/** Loads `.env` from the working directory if present. Real environment variables take precedence. */
export function loadEnvFile(path = '.env'): void {
  if (existsSync(path)) {
    process.loadEnvFile(path);
  }
}

/** Validates the environment and fails fast with a readable message if anything is missing or invalid. */
export function parseEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Invalid environment configuration:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
