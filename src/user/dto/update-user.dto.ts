import { IsMobilePhone, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateUserDto {
    @ApiProperty()
    headPic: string

    @ApiProperty()
    nickName: string

    @IsMobilePhone('zh-CN', {}, { message: '电话号码格式有误' })
    @ApiProperty()
    phoneNumber: string

    @IsNotEmpty({ message: '验证码不能为空' })
    @ApiProperty()
    captcha: string
}