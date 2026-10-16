import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Env } from './config/env';

/**
 * HTTP settings shared by the real server (main.ts) and the integration tests,
 * so the tests exercise exactly what production runs.
 */
export function configureApp(app: NestExpressApplication, env: Env): void {
  // Every endpoint lives under /api/v1 (ARCHITECTURE.md §7.3, D-18).
  app.setGlobalPrefix('api/v1');

  // Strict CORS: only the DayCraft web app's origin, with cookies (SECURITY.md §2.7).
  app.enableCors({ origin: env.WEB_ORIGIN, credentials: true });

  // Don't advertise the framework.
  app.disable('x-powered-by');

  // Close database connections cleanly when Docker stops the container.
  app.enableShutdownHooks();
}
