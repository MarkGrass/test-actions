import { registerAs } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';

import type ms from 'ms';

export const accessJwtConfig = registerAs(
    'access-jwt',
    (): JwtModuleOptions => ({
        secret: process.env.ACCESS_SECRET,
        signOptions: {
            expiresIn:
                (process.env.ACCESS_LIVE_TIME as ms.StringValue) ?? '10m',
        },
    }),
);
