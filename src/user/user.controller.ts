import { Body, Controller, Get, Inject, Post, Query, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RequireLogin, UserInfo } from '../custom.decorator';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';

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
        console.log(registerUserDto);
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

    private setUserAccessToken = (user) => {
        return this.jwtService.sign({
            userId: user.id,
            username: user.username,
            roles: user.roles,
            permissions: user.permissions
        }, {
            expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME') || '30m'
        });
    };

    private setUserRefreshToken = user => {
        return this.jwtService.sign({
            userId: user.id
        }, {
            expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_TIME') || '7d'
        });
    };

    //用户刷新token
    @Get('refresh')
    async userRefresh(@Query('refreshToken') refreshToken: string) {
        try {
            const data = this.jwtService.verify(refreshToken);

            const user = await this.userService.findOneById(data.userId, false);

            const access_token = this.setUserAccessToken(user);

            const refresh_token = this.setUserRefreshToken(user);

            return {
                access_token,
                refresh_token
            };

        } catch (e) {
            throw new UnauthorizedException('token 已失效,请重新登陆');
        }
    }

    //管理员刷新token
    @Get('admin/refresh')
    async adminRefresh(@Query('refreshToken') refreshToken: string) {
        try {
            const data = this.jwtService.verify(refreshToken);

            const user = await this.userService.findOneById(data.userId, true);

            const access_token = this.setUserAccessToken(user);

            const refresh_token = this.setUserRefreshToken(user);

            return {
                access_token,
                refresh_token
            };

        } catch (e) {
            throw new UnauthorizedException('token 已失效,请重新登陆');
        }
    }

    //获取用户信息
    @Get('info')
    @RequireLogin()
    async info(@UserInfo('userId') userId: number) {
        return await this.userService.findUserDetailBuId(userId);
    }

    //修改密码
    @Post(['update_password', 'admin/update_password'])
    @RequireLogin()
    async updatePassword(@UserInfo('userId') userId: number, @Body() passwordDto: UpdateUserPasswordDto) {
        return await this.userService.updatePassword(userId, passwordDto);
    }
}
