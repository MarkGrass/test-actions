import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { USER_ROLE } from '@shared/types';

import { User } from '@entities';

import { ROLES_KEY } from '../decorators/role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<USER_ROLE[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles?.length) {
            return true;
        }
        const user: User = context.switchToHttp().getRequest().user;

        return Boolean(user) && requiredRoles.includes(user.role);
    }
}
