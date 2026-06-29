import { SetMetadata } from '@nestjs/common';

import type { USER_ROLE } from '../types';

export const ROLES_KEY = 'role';

export const Role = (...roles: [USER_ROLE, ...USER_ROLE[]]) =>
    SetMetadata(ROLES_KEY, roles);
