import type { USER_ROLE } from '@shared/types';

export type JwtPayload = {
    sub: string;
    email: string;
    role: USER_ROLE;
};
