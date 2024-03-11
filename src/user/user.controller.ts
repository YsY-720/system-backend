import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    HttpStatus,
    Inject,
    ParseIntPipe,
    Post,
    Query,
    UnauthorizedException
} from '@nestjs/common'
import { UserService } from './user.service'
import { RegisterUserDto } from './dto/register-user.dto'
import { LoginUserDto } from './dto/login-user.dto'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { RequireLogin, UserInfo } from '../custom.decorator'
import { UpdateUserPasswordDto } from './dto/update-user-password.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { generateParseIntPipe } from '../utils'
import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { LoginUserVo } from './vo/login-user.vo'
import { RefreshTokenVo } from './vo/refresh-token.vo'
import { UserListVo } from './vo/user-list.vo'
import { UserInfoVo } from './vo/user-info.vo'

@ApiTags('用户管理模块')
@Controller('user')
export class UserController {

    @Inject(UserService)
    private readonly userService: UserService

    @Inject(JwtService)
    private readonly jwtService: JwtService

    @Inject(ConfigService)
    private readonly configService: ConfigService

    @Get('init')
    async init() {
        await this.userService.initData()
        return 'done'
    }

    @ApiBody({ type: RegisterUserDto })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: '验证码已失效/验证码不正确/用户已存在',
        type: String
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '注册成功/失败',
        type: String
    })
    @Post('register')
    async register(@Body() registerUserDto: RegisterUserDto) {
        console.log(registerUserDto)
        return await this.userService.register(registerUserDto)
    }

    @ApiQuery({
        name: 'email',
        type: String,
        description: '邮箱地址',
        required: true,
        example: 'xxx@xx.com'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '发送成功',
        type: String
    })
    @Get('register_captcha')
    async login_captcha(@Query('email') email: string) {
        return this.userService.login_captcha(email)
    }

    @ApiQuery({
        name: 'email',
        type: String,
        description: '邮箱地址',
        required: true,
        example: 'xxx@xx.com'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '发送成功',
        type: String
    })
    @Get('update_password/captcha')
    async update_password_captcha(@Query('email') email: string) {
        return await this.userService.update_password_captcha(email)
    }

    @ApiBearerAuth()
    @ApiResponse({
        status: HttpStatus.OK,
        description: '发送成功',
        type: String
    })
    @RequireLogin()
    @Get('update_user/captcha')
    async update_user_captcha(@UserInfo('email') email: string) {
        return await this.userService.update_user_captcha(email)
    }

    //普通用户登录
    @ApiBody({
        type: LoginUserDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: '用户不存在/密码错误',
        type: String
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '用户信息和 token',
        type: LoginUserVo
    })
    @Post('login')
    async userLogin(@Body() userLogin: LoginUserDto) {
        const userVo = await this.userService.userLogin(userLogin, false)

        userVo.accessToken = this.jwtService.sign({
            userId: userVo.userInfo.id,
            username: userVo.userInfo.username,
            email: userVo.userInfo.email,
            roles: userVo.userInfo.roles,
            permissions: userVo.userInfo.permissions
        }, {
            expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME') || '30m'
        })

        userVo.refreshToken = this.jwtService.sign({
            userId: userVo.userInfo.id
        }, {
            expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_TIME') || '7d'
        })

        return userVo
    }

    //管理员登录
    @ApiBody({
        type: LoginUserDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: '用户不存在/密码错误',
        type: String
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '用户信息和 token',
        type: LoginUserVo
    })
    @Post('admin/login')
    async adminLogin(@Body() userLogin: LoginUserDto) {
        const adminVo = await this.userService.userLogin(userLogin, true)

        adminVo.accessToken = this.jwtService.sign({
            userId: adminVo.userInfo.id,
            username: adminVo.userInfo.username,
            email: adminVo.userInfo.email,
            roles: adminVo.userInfo.roles,
            permissions: adminVo.userInfo.permissions
        }, {
            expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME') || '30m'
        })

        adminVo.refreshToken = this.jwtService.sign({
            userId: adminVo.userInfo.id
        }, {
            expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_TIME') || '7d'
        })

        return adminVo
    }

    private setUserAccessToken = (user) => {
        return this.jwtService.sign({
            userId: user.id,
            username: user.username,
            email: user.email,
            roles: user.roles,
            permissions: user.permissions
        }, {
            expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME') || '30m'
        })
    };

    private setUserRefreshToken = user => {
        return this.jwtService.sign({
            userId: user.id
        }, {
            expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_TIME') || '7d'
        })
    };

    //用户刷新token
    @ApiQuery({
        name: 'refreshToken',
        type: String,
        description: '刷新 token',
        required: true,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'token 已失效，请重新登录'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '刷新成功',
        type: RefreshTokenVo
    })
    @Get('refresh')
    async userRefresh(@Query('refreshToken') refreshToken: string) {
        try {
            const data = this.jwtService.verify(refreshToken)

            const user = await this.userService.findOneById(data.userId, false)

            const vo = new RefreshTokenVo()
            vo.access_token = this.setUserAccessToken(user)
            vo.refresh_token = this.setUserRefreshToken(user)

            return vo

        } catch (e) {
            throw new UnauthorizedException('token 已失效,请重新登陆')
        }
    }

    //管理员刷新token
    @ApiQuery({
        name: 'refreshToken',
        type: String,
        description: '刷新 token',
        required: true,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'token 已失效，请重新登录'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '刷新成功',
        type: RefreshTokenVo
    })
    @Get('admin/refresh')
    async adminRefresh(@Query('refreshToken') refreshToken: string) {
        try {
            const data = this.jwtService.verify(refreshToken)

            const user = await this.userService.findOneById(data.userId, true)

            const vo = new RefreshTokenVo()
            vo.access_token = this.setUserAccessToken(user)
            vo.refresh_token = this.setUserRefreshToken(user)

            return vo

        } catch (e) {
            throw new UnauthorizedException('token 已失效,请重新登陆')
        }
    }

    //获取用户信息
    @ApiBearerAuth()
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'success',
        type: UserInfoVo
    })
    @Get('info')
    @RequireLogin()
    async info(@UserInfo('userId') userId: number) {
        return await this.userService.findUserDetailBuId(userId)
    }

    //修改密码
    @ApiBody({
        type: UpdateUserPasswordDto
    })
    @ApiResponse({
        type: String,
        description: '验证码已失效/不正确'
    })
    @Post(['update_password', 'admin/update_password'])
    async updatePassword(@Body() passwordDto: UpdateUserPasswordDto) {
        return await this.userService.updatePassword(passwordDto)
    }

    //修改信息
    @ApiBearerAuth()
    @ApiBody({
        type: UpdateUserDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: '验证码已失效/不正确'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '更新成功',
        type: String
    })
    @Post(['update', 'admin/update'])
    @RequireLogin()
    async update(@UserInfo('userId') userId: number, @Body() updateUserDto: UpdateUserDto) {
        return await this.userService.update(userId, updateUserDto)
    }

    //冻结用户
    @ApiBearerAuth()
    @ApiQuery({
        name: 'id',
        description: 'userId',
        type: Number
    })
    @ApiQuery({
        name: 'isFreeze',
        description: '0：解冻，1：冻结',
        type: Number
    })
    @ApiResponse({
        type: String,
        description: 'success'
    })
    @RequireLogin()
    @Get('freeze')
    async freezeUserById(@Query('id', ParseIntPipe) id: number, @Query('isFrozen', ParseIntPipe) isFrozen: number) {
        return await this.userService.freezeUserById(id, isFrozen)
    }

    //用户列表分页查询
    @ApiBearerAuth()
    @ApiQuery({
        name: 'pageNum',
        description: '页码',
        type: Number
    })
    @ApiQuery({
        name: 'pageSize',
        description: '每页条数',
        type: Number
    })
    @ApiQuery({
        name: 'username',
        description: '用户名',
        type: Number
    })
    @ApiQuery({
        name: 'nickName',
        description: '昵称',
        type: Number
    })
    @ApiQuery({
        name: 'email',
        description: '邮箱地址',
        type: Number
    })
    @ApiResponse({
        type: UserListVo,
        description: '用户列表',
    })
    @RequireLogin()
    @Get('list')
    async list(
        @Query(
            'pageNum',
            new DefaultValuePipe(1),
            generateParseIntPipe('pageNum')) pageNum: number,
        @Query(
            'pageSize',
            new DefaultValuePipe(10),
            generateParseIntPipe('pageSize')) pageSize: number,
        @Query('username') username: string,
        @Query('nickName') nickName: string,
        @Query('email') email: string
    ) {
        return await this.userService.findUserByPage(pageNum, pageSize, username, nickName, email)
    }
}
