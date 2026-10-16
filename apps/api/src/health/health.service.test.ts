import { Logger } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { Env } from '../config/env';
import type { PrismaService } from '../prisma/prisma.service';
import { HealthService } from './health.service';

const env = { APP_VERSION: 'test-sha' } as Env;

function serviceWithDatabase(queryRaw: () => Promise<unknown>): HealthService {
  const prisma = { $queryRaw: vi.fn(queryRaw) } as unknown as PrismaService;
  return new HealthService(prisma, env);
}

describe('HealthService', () => {
  it('reports liveness with the app version', () => {
    const health = serviceWithDatabase(() => Promise.resolve([]));
    expect(health.live()).toMatchObject({ status: 'ok', version: 'test-sha' });
  });

  it('is ready when the database answers', async () => {
    const health = serviceWithDatabase(() => Promise.resolve([{ '?column?': 1 }]));
    await expect(health.ready()).resolves.toEqual({ status: 'ok', checks: { database: 'up' } });
  });

  it('is unavailable (not crashing) when the database is down', async () => {
    // The warning is expected here; keep the test output clean.
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const health = serviceWithDatabase(() => Promise.reject(new Error('connection refused')));
    await expect(health.ready()).resolves.toEqual({
      status: 'unavailable',
      checks: { database: 'down' },
    });
  });
});
