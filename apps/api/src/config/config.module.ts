import { Global, Module } from '@nestjs/common';
import { ENV, parseEnv } from './env';

/** Provides the validated environment (`@Inject(ENV)`) to every module. */
@Global()
@Module({
  providers: [{ provide: ENV, useFactory: () => parseEnv() }],
  exports: [ENV],
})
export class ConfigModule {}
