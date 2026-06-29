import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy } from 'passport-local';

import { verify } from 'argon2';

import { User } from '@entities';

import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private moduleRef: ModuleRef) {
        super({
            usernameField: 'email',
            passReqToCallback: true,
        });
    }

    async validate(
        request: Request,
        email: string,
        password: string,
    ): Promise<User> {
        const contextId = ContextIdFactory.getByRequest(request);
        const authService = await this.moduleRef.resolve(
            AuthService,
            contextId,
        );

        const user = await authService.validateUser({ email });

        if (!user) {
            throw new UnauthorizedException('Пользователь не найден');
        }

        const isPasswordMatch = await verify(user.password, password);

        if (!isPasswordMatch) {
            throw new UnauthorizedException(
                'Неправильно введен email или пароль',
            );
        }

        return user;
    }
}
