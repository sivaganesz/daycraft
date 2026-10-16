import { describe, expect, it } from 'vitest';
import { parseEnv } from './env';

const valid = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  WEB_ORIGIN: 'http://localhost:5173',
};

describe('parseEnv', () => {
  it('applies defaults to a minimal valid environment', () => {
    const env = parseEnv(valid);
    expect(env.PORT).toBe(3000);
    expect(env.NODE_ENV).toBe('development');
    expect(env.APP_VERSION).toBe('dev');
  });

  it('fails fast when DATABASE_URL is missing', () => {
    expect(() => parseEnv({ WEB_ORIGIN: valid.WEB_ORIGIN })).toThrow(/DATABASE_URL/);
  });

  it('rejects a non-PostgreSQL database URL', () => {
    expect(() => parseEnv({ ...valid, DATABASE_URL: 'mysql://localhost/db' })).toThrow(
      /DATABASE_URL/,
    );
  });
});
