import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { HealthResponse, ReadinessResponse } from '@daycraft/shared';
import type { Response } from 'express';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  live(): HealthResponse {
    return this.health.live();
  }

  /** Returns 503 when not ready, so Docker, the deploy pipeline, and uptime monitors can detect it. */
  @Get('ready')
  async ready(@Res({ passthrough: true }) res: Response): Promise<ReadinessResponse> {
    const result = await this.health.ready();
    if (result.status !== 'ok') {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }
}
