import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import type { Request } from 'express';

@Injectable()
export class PermissionGuard implements CanActivate {

    @Inject()
    private readonly reflector: Reflector;

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request: Request = context.switchToHttp().getRequest();

        if (!request.user) return true;

        const permissions = request.user.permissions;

        const requirePermissions = this.reflector.getAllAndOverride<string[]>('require-permission', [
            context.getHandler(),
            context.getClass()
        ]);

        if (!requirePermissions) return true;

        for (let i = 0; i < requirePermissions.length; i++) {
            const currPermission = requirePermissions[i];
            const found = permissions.find(item => item.code === currPermission);
            if (!found) throw new UnauthorizedException('您没有访问该接口的权限');
        }

        return true;
    }
}
