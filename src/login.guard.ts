import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common'
import { Observable } from 'rxjs'
import { Permission } from './user/entities/permission.entity'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { UnLoginException } from './unLogin.filter'

import type { Request } from 'express'

interface JwtUserData {
    userId: number
    username: string
    email: string,
    roles: string[]
    permissions: Permission[]
}

declare module 'express' {
    interface Request {
        user: JwtUserData
    }
}

@Injectable()
export class LoginGuard implements CanActivate {

    @Inject()
    private readonly reflector: Reflector

    @Inject(JwtService)
    private readonly jwtService: JwtService

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {

        const request: Request = context.switchToHttp().getRequest()

        const requireLogin = this.reflector.getAllAndOverride('require-login', [
            context.getClass(),
            context.getHandler()
        ])

        if (!requireLogin) {
            return true
        }

        const authorization = request.headers.authorization

        if (!authorization) throw new UnLoginException('用户未登录')

        try {
            const token = authorization.split(' ')[1]
            const data = this.jwtService.verify<JwtUserData>(token)

            request.user = {
                userId: data.userId,
                username: data.username,
                email: data.email,
                roles: data.roles,
                permissions: data.permissions
            }
            return true
        } catch (e) {
            throw new UnLoginException('token 失效, 请重新登录')
        }
    }
}
