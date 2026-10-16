import { Inject, Injectable, Logger } from '@nestjs/common';
import type { HealthResponse, ReadinessResponse } from '@daycraft/shared';
import { ENV, type Env } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(ENV) private readonly env: Env,
  ) {}

  /** Liveness: the process is running. Never touches the database. */
  live(): HealthResponse {
    return {
      status: 'ok',
      version: this.env.APP_VERSION,
      uptimeSeconds: Math.round(process.uptime()),
    };
  }

  /** Readiness: the API can serve requests, i.e. the database answers. */
  async ready(): Promise<ReadinessResponse> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', checks: { database: 'up' } };
    } catch (error) {
      this.logger.warn({ err: error }, 'Readiness check failed: database unreachable');
      return { status: 'unavailable', checks: { database: 'down' } };
    }
  }
}
