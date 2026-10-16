import { describe, expect, it } from 'vitest';
import { apiUrl } from './api';

describe('apiUrl', () => {
  const base = 'https://daycraft-api.whitraworks.online';

  it('prefixes paths with /api/v1', () => {
    expect(apiUrl('health', base)).toBe(`${base}/api/v1/health`);
  });

  it('accepts paths with a leading slash', () => {
    expect(apiUrl('/health/ready', base)).toBe(`${base}/api/v1/health/ready`);
  });

  it('ignores a trailing slash on the base URL', () => {
    expect(apiUrl('health', `${base}/`)).toBe(`${base}/api/v1/health`);
  });

  it('explains how to fix a missing base URL', () => {
    expect(() => apiUrl('health', '')).toThrow(/VITE_API_URL/);
  });
});
