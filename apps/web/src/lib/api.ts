import type { ZodType } from 'zod';

/** An HTTP error from the API, with its status code. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Builds a full API URL: `apiUrl('health')` → `<base>/api/v1/health` (ARCHITECTURE.md §7.3). */
export function apiUrl(path: string, base: string = import.meta.env.VITE_API_URL): string {
  if (!base) {
    throw new Error('VITE_API_URL is not set. Copy apps/web/.env.example to apps/web/.env.');
  }
  return new URL(`/api/v1/${path.replace(/^\/+/, '')}`, base).toString();
}

interface RequestOptions {
  /** Non-2xx statuses whose body is still a valid response (e.g. 503 from the readiness check). */
  acceptStatuses?: number[];
  signal?: AbortSignal;
}

/**
 * GETs JSON from the API and validates it with the shared Zod schema.
 * Cookies are always sent (`credentials: 'include'`); tokens are never stored in JavaScript.
 */
export async function getJson<T>(
  path: string,
  schema: ZodType<T>,
  { acceptStatuses = [], signal }: RequestOptions = {},
): Promise<T> {
  const res = await fetch(apiUrl(path), {
    credentials: 'include',
    headers: { Accept: 'application/json' },
    signal: signal ?? null,
  });
  if (!res.ok && !acceptStatuses.includes(res.status)) {
    throw new ApiError(`Request to ${path} failed with status ${res.status}`, res.status);
  }
  return schema.parse(await res.json());
}
