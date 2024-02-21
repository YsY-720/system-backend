interface UserInfo {
    id: number;

    username: string;

    nickName: string;

    email: string;

    headPic: string;

    phoneNumber: string;

    isFrozen: boolean;

    isAdmin: boolean;

    createTime: Date;

    roles: string[];

    permissions: string[];
}

//用户登录成功后返回结果ViewObject
export class LoginUserVo {
    userInfo: UserInfo;

    accessToken: string;

    refreshToken: string;
}