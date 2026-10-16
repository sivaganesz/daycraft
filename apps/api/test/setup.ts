import 'reflect-metadata';
import { loadEnvFile } from '../src/config/env';

// Tests use the same local `.env` as development, with quieter logs.
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL ??= 'error';
loadEnvFile();
