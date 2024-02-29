import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateUserPasswordDto {
    @IsNotEmpty({ message: '账号不能为空' })
    @ApiProperty()
    username: string

    @IsNotEmpty({ message: '密码不能为空' })
    @MinLength(6, { message: '密码不能小于 6 位' })
    @ApiProperty()
    password: string

    @IsNotEmpty({ message: '邮箱不能为空' })
    @IsEmail({}, { message: '请输入正确的邮箱地址' })
    @ApiProperty()
    email: string

    @IsNotEmpty({ message: '验证码不能为空' })
    @ApiProperty()
    captcha: string
}