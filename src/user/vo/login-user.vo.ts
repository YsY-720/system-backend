import { ApiProperty } from '@nestjs/swagger';

class UserInfo {
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

    @ApiProperty({ example: 132456627512 })
    phoneNumber: string;

    @ApiProperty()
    isFrozen: boolean;

    @ApiProperty()
    isAdmin: boolean;

    @ApiProperty()
    createTime: Date;

    @ApiProperty({ example: ['管理员'] })
    roles: string[];

    @ApiProperty({ example: 'query_aaa' })
    permissions: string[];
}

//用户登录成功后返回结果ViewObject
export class LoginUserVo {
    @ApiProperty()
    userInfo: UserInfo;

    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;
}