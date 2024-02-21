import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import type { Request } from 'express';

export const RequireLogin = () => SetMetadata('require-login', true);

export const RequirePermission = (...args: string[]) => SetMetadata('require-permission', args);

export const UserInfo = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<Request>();

        if (!request.user) {
            return null;
        }
        return data ? request.user[data] : request.user;
    },
);