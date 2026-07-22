import type { Request } from 'express';

import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { refreshJwtConfig } from '../../config/refresh-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../auth.types';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
    constructor(
        private authService: AuthService,
        @Inject(refreshJwtConfig.KEY)
        private refreshConfig: ConfigType<typeof refreshJwtConfig>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => req?.cookies?.refreshToken,
            ]),
            ignoreExpiration: false,
            secretOrKey: refreshConfig.secret as string,
            passReqToCallback: true,
        });
    }

    async validate(req: Request, { sub: userId }: JwtPayload) {
        const refreshToken = req.cookies?.refreshToken;

        return this.authService.validateRefreshToken(userId, refreshToken);
    }
}
