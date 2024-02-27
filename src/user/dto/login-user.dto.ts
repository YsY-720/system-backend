import { IsNotEmpty, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginUserDto {
    @IsNotEmpty({ message: '用户名不能为空' })
    @ApiProperty()
    username: string

    @IsNotEmpty({ message: '密码不能为空' })
    @MinLength(6, { message: '密码不能小于 6 位' })
    @ApiProperty()
    password: string
}