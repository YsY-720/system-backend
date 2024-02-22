import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UpdateUserPasswordDto {
    @IsNotEmpty({ message: '密码不能为空' })
    @MinLength(6, { message: '密码不能小于 6 位' })
    password: string;

    @IsNotEmpty({ message: '邮箱不能为空' })
    @IsEmail({}, { message: '请输入正确的邮箱地址' })
    email: string;

    @IsNotEmpty({ message: '验证码不能为空' })
    captcha: string;
}