import { IsEmail, IsNotEmpty } from "class-validator";

export class UpdateUserDto {
    headPic: string;

    nickName: string;

    @IsNotEmpty({ message: '邮箱地址不能为空' })
    @IsEmail({}, { message: '请输入合法的邮箱地址' })
    email: string;

    @IsNotEmpty({ message: '验证码不能为空' })
    captcha: string;
}