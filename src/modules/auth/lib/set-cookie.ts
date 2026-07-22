import type { Response } from 'express';

import type { ConfigService } from '@nestjs/config';

import ms from 'ms';

export type SetCookieArgs = {
    context: Response;
    config: ConfigService;
    name: string;
    value: string;
    liveTimeKey: string;
    path?: string;
};

export const setCookie = ({
    context,
    config,
    name,
    value,
    liveTimeKey,
    path,
}: SetCookieArgs) => {
    const cookieOptions: Record<string, unknown> = {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: ms(config.getOrThrow(liveTimeKey)),
    };

    if (path) {
        cookieOptions.path = path;
    }

    context.cookie(name, value, cookieOptions);
};
