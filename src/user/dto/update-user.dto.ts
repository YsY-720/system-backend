import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiProperty()
    headPic: string;

    @ApiProperty()
    nickName: string;

    @IsNotEmpty({ message: '验证码不能为空' })
    @ApiProperty()
    captcha: string;
}