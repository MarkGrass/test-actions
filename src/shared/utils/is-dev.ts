import type { ConfigService } from '@nestjs/config';

export const IS_DEV = process.env.NODE_ENV === 'development';

export const isDev = (configService: ConfigService) => {
    return configService.getOrThrow('NODE_ENV') === 'development';
};
