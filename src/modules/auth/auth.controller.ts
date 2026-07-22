import type { Response } from 'express';

import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { VerifyEmailDto } from '@modules/auth/dto/verify-email.dto';
import { setCookie } from '@modules/auth/lib/set-cookie';

import { JwtAuthGuard, LocalAuthGuard, RefreshAuthGuard } from '@guards';

import { Public } from '@decorators';

import { User } from '@entities';

import { AuthService } from './auth.service';
import { AuthUserDto } from './dto/auth-user.dto';

@ApiTags('Auth Module')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private readonly config: ConfigService,
    ) {}

    @ApiOperation({ summary: 'Register new user' })
    @Public()
    @Post('/registration')
    registration(@Body() data: AuthUserDto) {
        return this.authService.registration(data);
    }

    @ApiOperation({ summary: 'User email verification' })
    @Public()
    @Post('/verify-email')
    async verifyEmail(
        @Body() data: VerifyEmailDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { id, role, access, refresh } =
            await this.authService.verifyEmail(data);

        setCookie({
            context: res,
            config: this.config,
            name: 'accessToken',
            value: access,
            liveTimeKey: 'ACCESS_LIVE_TIME',
        });

        setCookie({
            context: res,
            config: this.config,
            name: 'refreshToken',
            value: refresh,
            liveTimeKey: 'REFRESH_LIVE_TIME',
            path: '/api/auth/refresh',
        });

        return {
            role,
            success: true,
            userId: id,
        };
    }

    @ApiOperation({ summary: 'Login user' })
    @UseGuards(LocalAuthGuard)
    @Post('/login')
    @Public()
    async login(
        @Req() req: { user: User },
        @Res({ passthrough: true }) res: Response,
    ) {
        const { id, role, access, refresh } = await this.authService.login(
            req.user,
        );

        setCookie({
            context: res,
            config: this.config,
            name: 'accessToken',
            value: access,
            liveTimeKey: 'ACCESS_LIVE_TIME',
        });

        setCookie({
            context: res,
            config: this.config,
            name: 'refreshToken',
            value: refresh,
            liveTimeKey: 'REFRESH_LIVE_TIME',
            path: '/api/auth/refresh',
        });

        return {
            role,
            success: true,
            userId: id,
        };
    }

    @ApiOperation({ summary: 'Logout user' })
    @UseGuards(JwtAuthGuard)
    @Post('/logout')
    logout(
        @Req() req: { user: User },
        @Res({ passthrough: true }) res: Response,
    ) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

        return this.authService.logout(req.user);
    }

    @ApiOperation({ summary: 'Refresh access token' })
    @Public()
    @UseGuards(RefreshAuthGuard)
    @Post('/refresh')
    async refresh(
        @Req() req: { user: User },
        @Res({ passthrough: true }) res: Response,
    ) {
        const { id, role, access, refresh } =
            await this.authService.refreshToken(req.user);

        setCookie({
            context: res,
            config: this.config,
            name: 'accessToken',
            value: access,
            liveTimeKey: 'ACCESS_LIVE_TIME',
        });

        setCookie({
            context: res,
            config: this.config,
            name: 'refreshToken',
            value: refresh,
            liveTimeKey: 'REFRESH_LIVE_TIME',
            path: '/api/auth/refresh',
        });

        return {
            role,
            success: true,
            userId: id,
        };
    }
}
