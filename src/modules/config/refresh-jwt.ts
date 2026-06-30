import { registerAs } from '@nestjs/config';
import type { JwtSignOptions } from '@nestjs/jwt';

import type ms from 'ms';

export const refreshJwtConfig = registerAs(
    'refresh-jwt',
    (): JwtSignOptions => ({
        secret: process.env.REFRESH_SECRET,
        expiresIn: (process.env.REFRESH_LIVE_TIME as ms.StringValue) ?? '7d',
    }),
);
