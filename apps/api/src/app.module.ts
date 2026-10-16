import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { ZodValidationPipe } from 'nestjs-zod';
import { ConfigModule } from './config/config.module';
import { ENV, type Env } from './config/env';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

/** Accept a caller's request ID only if it is short and safe to log; otherwise generate one. */
const SAFE_REQUEST_ID = /^[\w-]{1,64}$/;

function requestId(req: IncomingMessage, res: ServerResponse): string {
  const incoming = req.headers['x-request-id'];
  const id =
    typeof incoming === 'string' && SAFE_REQUEST_ID.test(incoming) ? incoming : randomUUID();
  res.setHeader('x-request-id', id);
  return id;
}

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ENV],
      useFactory: (env: Env) => ({
        pinoHttp: {
          level: env.LOG_LEVEL,
          genReqId: requestId,
          // Never log credentials (SECURITY.md §2.6).
          redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
          // Health checks are polled constantly; logging each one would bury real traffic.
          autoLogging: { ignore: (req: IncomingMessage) => req.url?.includes('/health') ?? false },
        },
      }),
    }),
    PrismaModule,
    HealthModule,
  ],
  providers: [
    // Validates every request against its Zod-based DTO (ARCHITECTURE.md §7.2).
    { provide: APP_PIPE, useClass: ZodValidationPipe },
  ],
})
export class AppModule {}
