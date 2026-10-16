import { z } from 'zod';

/** Response of `GET /api/v1/health`: the API process is alive. */
export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  version: z.string(),
  uptimeSeconds: z.number().nonnegative(),
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;

/** Response of `GET /api/v1/health/ready`: the API can serve traffic (database reachable). */
export const readinessResponseSchema = z.object({
  status: z.enum(['ok', 'unavailable']),
  checks: z.object({
    database: z.enum(['up', 'down']),
  }),
});
export type ReadinessResponse = z.infer<typeof readinessResponseSchema>;
