import { randomInt } from 'crypto';

import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { hash, verify } from 'argon2';

import { refreshJwtConfig } from '@config';
import { EmailService } from '@modules/email';
import { UsersService } from '@modules/users';
import ms from 'ms';

import { User } from '@entities';

import { JwtPayload } from './auth.types';
import { AuthUserDto } from './dto/auth-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
        private emailService: EmailService,
        private configService: ConfigService,
        @Inject(refreshJwtConfig.KEY)
        private refreshConfig: ConfigType<typeof refreshJwtConfig>,
    ) {}

    private async generateTokens({ email, id, role }: User) {
        const payload: JwtPayload = { email, role, sub: id };
        const [access, refresh] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, this.refreshConfig),
        ]);

        return {
            access,
            refresh,
        };
    }

    private verificationCodeExpires() {
        const liveTime = this.configService.getOrThrow(
            'VERIFICATION_CODE_LIVE_TIME',
        );
        const duration = ms(liveTime);

        return new Date(Date.now() + duration);
    }
    private generateEmailCode() {
        return randomInt(100000, 1000000).toString();
    }

    private async setAuthPayload(user: User) {
        const { access, refresh } = await this.generateTokens(user);
        const hashedRefreshToken = await hash(refresh);
        await this.userService.updateHashedRefreshToken(
            user.id,
            hashedRefreshToken,
        );

        return {
            id: user.id,
            access,
            refresh,
        };
    }

    async validateRefreshToken(id: string, refreshToken?: string) {
        const user = await this.userService.getUserById(id);
        if (!user || !refreshToken || !user.hashedRefreshToken) {
            throw new UnauthorizedException('Недействительный ключ обновления');
        }

        const refreshMatches = await verify(
            user.hashedRefreshToken,
            refreshToken,
        );

        if (!refreshMatches) {
            throw new UnauthorizedException('Недействительный ключ обновления');
        }

        return user;
    }

    async verifyEmail(email: string, code: string) {
        const user = await this.userService.getUserByEmail(email);
        const maxAttempts: number =
            this.configService.get('VERIFICATION_CODE_MAX_ATTEMPTS') ?? 5;
        if (!user || !user.emailVerificationCode) {
            throw new BadRequestException('Неправильно введен провечный код');
        }

        if (
            !user.emailVerificationExpires ||
            user.emailVerificationExpires < new Date()
        ) {
            throw new BadRequestException(
                'Срок действия провечного кода истек',
            );
        }

        if (user.emailVerificationAttempts >= maxAttempts) {
            throw new BadRequestException('Слишком много попыток проверки');
        }

        const isValidCode = await verify(user.emailVerificationCode, code);

        if (!isValidCode) {
            await this.userService.updateUser(user.id, {
                emailVerificationAttempts: user.emailVerificationAttempts + 1,
            });

            throw new BadRequestException('Неправильно введен провечный код');
        }

        const verifiedUser = await this.userService.updateUser(user.id, {
            isVerifiedEmail: true,
            emailVerificationCode: null,
            emailVerificationExpires: null,
            emailVerificationAttempts: 0,
        });

        return this.setAuthPayload(verifiedUser);
    }

    async validateUser({ email }: Pick<AuthUserDto, 'email'>) {
        return await this.userService.getUserByEmail(email);
    }

    async refreshToken(user: User) {
        return this.setAuthPayload(user);
    }

    async login(user: User) {
        if (!user.isVerifiedEmail) {
            throw new UnauthorizedException('Email не подтвержден');
        }

        return this.setAuthPayload(user);
    }

    async registration({ email, password }: AuthUserDto) {
        const candidate = await this.userService.getUserByEmail(email);
        if (candidate) {
            throw new HttpException(
                'User with this email already exists',
                HttpStatus.BAD_REQUEST,
            );
        }
        const user = await this.userService.create({
            email,
            password,
        });

        const code = this.generateEmailCode();

        await this.userService.updateUser(user.id, {
            emailVerificationCode: await hash(code),
            emailVerificationExpires: this.verificationCodeExpires(),
            emailVerificationAttempts: 0,
        });

        await this.emailService.sendMail({
            to: user.email,
            subject: 'Код подтверждегния',
            template: 'verification',
            context: { code },
        });

        return {
            success: true,
            message: 'Проверочный код отправлен на вашу почту.',
        };
    }

    async logout(user: User) {
        await this.userService.updateHashedRefreshToken(user.id, null);

        return { success: true };
    }
}
