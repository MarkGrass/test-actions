import type { ConfigModule } from '@nestjs/config';
import { registerAs } from '@nestjs/config';

export const appConfig = registerAs<ConfigModule>('app', () => ({
    nodeEnv: process.env.NODE_ENV,
    name: process.env.APP_NAME,
    workingDirectory: process.cwd(),
    port: Number(process.env.APP_PORT),
}));
