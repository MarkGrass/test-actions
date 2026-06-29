import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { appConfig, databaseConfig, mailerConfig } from '@config';
import { AuthModule } from '@modules/auth';
import { TypeORMConfigFactory } from '@modules/database';
import { EmailModule } from '@modules/email';
import { UsersModule } from '@modules/users';
import { MailerModule } from '@nestjs-modules/mailer';

import { JwtAuthGuard, RoleGuard } from '@guards';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env'],
            expandVariables: true,
            load: [appConfig, databaseConfig, mailerConfig],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useClass: TypeORMConfigFactory,
        }),
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: mailerConfig,
        }),
        UsersModule,
        AuthModule,
        EmailModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RoleGuard,
        },
    ],
})
export class AppModule {}
