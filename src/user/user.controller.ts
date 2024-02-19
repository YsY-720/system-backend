import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('user')
export class UserController {

    @Inject(UserService)
    private readonly userService: UserService;

    @Inject(JwtService)
    private readonly jwtService: JwtService;

    @Inject(ConfigService)
    private readonly configService: ConfigService;

    @Get('init')
    async init() {
        await this.userService.initData();
        return 'done';
    }

    @Post('register')
    async register(@Body() registerUserDto: RegisterUserDto) {
        return await this.userService.register(registerUserDto);
    }

    @Get('register_captcha')
    async captcha(@Query('email') email: string) {
        return this.userService.captcha(email);
    }

    //普通用户登录
    @Post('login')
    async userLogin(@Body() userLogin: LoginUserDto) {
        const userVo = await this.userService.userLogin(userLogin, false);

        userVo.accessToken = this.jwtService.sign({
            userId: userVo.userInfo.id,
            username: userVo.userInfo.username,
            roles: userVo.userInfo.roles,
            permissions: userVo.userInfo.permissions
        }, {
            expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME') || '30m'
        });

        userVo.refreshToken = this.jwtService.sign({
            userId: userVo.userInfo.id
        }, {
            expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_TIME') || '7d'
        });

        return userVo;
    }

    //管理员登录
    @Post('admin/login')
    async adminLogin(@Body() userLogin: LoginUserDto) {
        const adminVo = await this.userService.userLogin(userLogin, true);

        adminVo.accessToken = this.jwtService.sign({
            userId: adminVo.userInfo.id,
            username: adminVo.userInfo.username,
            roles: adminVo.userInfo.roles,
            permissions: adminVo.userInfo.permissions
        }, {
            expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME') || '30m'
        });

        adminVo.refreshToken = this.jwtService.sign({
            userId: adminVo.userInfo.id
        }, {
            expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_TIME') || '7d'
        });

        return adminVo;
    }
}
