import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiProperty()
    headPic: string;

    @ApiProperty()
    nickName: string;

    @IsNotEmpty({ message: '邮箱地址不能为空' })
    @IsEmail({}, { message: '请输入合法的邮箱地址' })
    @ApiProperty()
    email: string;

    @IsNotEmpty({ message: '验证码不能为空' })
    @ApiProperty()
    captcha: string;
}