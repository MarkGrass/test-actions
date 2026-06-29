import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { accessJwtConfig, refreshJwtConfig } from '@config';
import { EmailModule } from '@modules/email';
import { UsersModule } from '@modules/users';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';

@Module({
    providers: [AuthService, LocalStrategy, JwtStrategy, RefreshStrategy],
    controllers: [AuthController],
    imports: [
        JwtModule.registerAsync(accessJwtConfig.asProvider()),
        ConfigModule.forFeature(accessJwtConfig),
        ConfigModule.forFeature(refreshJwtConfig),
        UsersModule,
        EmailModule,
    ],
})
export class AuthModule {}
