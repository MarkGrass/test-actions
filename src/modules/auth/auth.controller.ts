import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { VerifyEmailDto } from '@modules/auth/dto/verify-email.dto';

import { JwtAuthGuard, LocalAuthGuard, RefreshAuthGuard } from '@guards';

import { Public } from '@decorators';

import { User } from '@entities';

import { AuthService } from './auth.service';
import { AuthUserDto } from './dto/auth-user.dto';

@ApiTags('Auth Module')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiOperation({ summary: 'Register new user' })
    @Public()
    @Post('/registration')
    registration(@Body() data: AuthUserDto) {
        return this.authService.registration(data);
    }

    @ApiOperation({ summary: 'User email verification' })
    @Public()
    @Post('/verify-email')
    verifyEmail(@Body() data: VerifyEmailDto) {
        return this.authService.verifyEmail(data.email, data.code);
    }

    @ApiOperation({ summary: 'Login user' })
    @UseGuards(LocalAuthGuard)
    @Post('/login')
    @Public()
    login(@Req() req: { user: User }) {
        return this.authService.login(req.user);
    }

    @ApiOperation({ summary: 'Logout user' })
    @UseGuards(JwtAuthGuard)
    @Post('/logout')
    logout(@Req() req: { user: User }) {
        return this.authService.logout(req.user);
    }

    @ApiOperation({ summary: 'Refresh access token' })
    @UseGuards(RefreshAuthGuard)
    @Post('/refresh')
    refresh(@Req() req: { user: User }) {
        return this.authService.refreshToken(req.user);
    }
}
