import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { swaggerInit } from '@config';
import { AppModule } from '@modules/app/app.module';
import cookieParser from 'cookie-parser';
import { config as envConfig } from 'dotenv';

envConfig();

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const config = app.get(ConfigService);

    swaggerInit(app);

    app.setGlobalPrefix('api');
    app.set('query parser', 'extended');

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    app.use(cookieParser());

    app.enableCors({
        origin: config.getOrThrow('ALLOWED_ORIGIN'),
        credentials: true,
        exposedHeaders: ['set-cookie'],
    });

    await app.listen(config.getOrThrow('APP_PORT'));
}

bootstrap();
