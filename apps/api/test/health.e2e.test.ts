import { healthResponseSchema, readinessResponseSchema } from '@daycraft/shared';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { ENV, type Env } from '../src/config/env';

/**
 * Integration test: boots the real app against the real PostgreSQL
 * (run `pnpm db:up` first; CI provides a temporary database).
 */
describe('Health endpoints (integration)', () => {
  let app: NestExpressApplication;
  let env: Env;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>({ logger: false });
    env = app.get<Env>(ENV);
    configureApp(app, env);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health reports the API is alive', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    expect(healthResponseSchema.parse(res.body).status).toBe('ok');
    expect(res.headers['x-request-id']).toBeTruthy();
  });

  it('GET /api/v1/health/ready reports the database is up', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health/ready').expect(200);
    expect(readinessResponseSchema.parse(res.body)).toEqual({
      status: 'ok',
      checks: { database: 'up' },
    });
  });

  it('allows CORS only for the web app origin', async () => {
    const allowed = await request(app.getHttpServer())
      .options('/api/v1/health')
      .set('Origin', env.WEB_ORIGIN)
      .set('Access-Control-Request-Method', 'GET');
    expect(allowed.headers['access-control-allow-origin']).toBe(env.WEB_ORIGIN);
    expect(allowed.headers['access-control-allow-credentials']).toBe('true');

    const blocked = await request(app.getHttpServer())
      .options('/api/v1/health')
      .set('Origin', 'https://evil.example')
      .set('Access-Control-Request-Method', 'GET');
    expect(blocked.headers['access-control-allow-origin']).not.toBe('https://evil.example');
  });

  it('does not reveal the framework', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('serves nothing outside /api/v1', async () => {
    await request(app.getHttpServer()).get('/health').expect(404);
  });
});
