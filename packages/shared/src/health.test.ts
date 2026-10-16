import { describe, expect, it } from 'vitest';
import { healthResponseSchema, readinessResponseSchema } from './health.js';

describe('health schemas', () => {
  it('accepts a valid health response', () => {
    const parsed = healthResponseSchema.parse({
      status: 'ok',
      version: '0.0.0',
      uptimeSeconds: 12,
    });
    expect(parsed.status).toBe('ok');
  });

  it('rejects a negative uptime', () => {
    const result = healthResponseSchema.safeParse({
      status: 'ok',
      version: '0.0.0',
      uptimeSeconds: -1,
    });
    expect(result.success).toBe(false);
  });

  it('accepts an unavailable readiness response', () => {
    const parsed = readinessResponseSchema.parse({
      status: 'unavailable',
      checks: { database: 'down' },
    });
    expect(parsed.checks.database).toBe('down');
  });
});
