import {Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query} from '@nestjs/common';
import {UserService} from './user.service';
import {RegisterUserDto} from './dto/register-user.dto';

@Controller('user')
export class UserController {

    @Inject(UserService)
    private readonly userService: UserService;

    @Post('register')
    async register(@Body() registerUserDto: RegisterUserDto) {
        return await this.userService.register(registerUserDto);
    }

    @Get('register_captcha')
    async captcha(@Query('email') email: string) {
        return this.userService.captcha(email);
    }
}
