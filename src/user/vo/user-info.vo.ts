import { ApiProperty } from '@nestjs/swagger';

export class UserInfoVo {
    @ApiProperty()
    id: number;

    @ApiProperty({ example: 'zhangSan' })
    username: string;

    @ApiProperty({ example: '张三' })
    nickName: string;

    @ApiProperty({ example: 'xxxx@xx.com' })
    email: string;

    @ApiProperty({ example: 'xxx.png' })
    headPic: string;

    @ApiProperty({ example: '13415687965' })
    phoneNumber: string;

    @ApiProperty()
    isFrozen: boolean;

    @ApiProperty()
    createTime: Date;
}