import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Like, Repository } from 'typeorm'
import { md5 } from 'src/utils'
import { RedisService } from 'src/redis/redis.service'
import { EmailService } from 'src/email/email.service'
import { User } from './entities/user.entity'
import { Role } from './entities/role.entity'
import { Permission } from './entities/permission.entity'
import { LoginUserDto } from './dto/login-user.dto'
import { UpdateUserPasswordDto } from './dto/update-user-password.dto'
import { RegisterUserDto } from './dto/register-user.dto'
import { LoginUserVo } from './vo/login-user.vo'
import { UserInfoVo } from './vo/user-info.vo'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserListVo } from './vo/user-list.vo'

@Injectable()
export class UserService {
    private logger = new Logger();

    @InjectRepository(User)
    private readonly userRepository: Repository<User>

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>

    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>

    @Inject(RedisService)
    private readonly redisService: RedisService

    @Inject(EmailService)
    private readonly emailService: EmailService

    async initData() {
        const user1 = new User()
        user1.username = 'zhangSan'
        user1.password = md5('111111')
        user1.email = 'xxx@xx.com'
        user1.isAdmin = true
        user1.nickName = '张三'
        user1.phoneNumber = '13233323333'

        const user2 = new User()
        user2.username = 'liSi'
        user2.password = md5('222222')
        user2.email = 'yy@yy.com'
        user2.nickName = '李四'

        const role1 = new Role()
        role1.name = '管理员'

        const role2 = new Role()
        role2.name = '普通用户'

        const permission1 = new Permission()
        permission1.code = 'ccc'
        permission1.description = '访问 ccc 接口'

        const permission2 = new Permission()
        permission2.code = 'ddd'
        permission2.description = '访问 ddd 接口'

        user1.roles = [role1]
        user2.roles = [role2]

        role1.permissions = [permission1, permission2]
        role2.permissions = [permission1]

        await this.permissionRepository.save([permission1, permission2])
        await this.roleRepository.save([role1, role2])
        await this.userRepository.save([user1, user2])
    }

    //注册-发送验证码
    async login_captcha(email: string) {
        const code = Math.random().toString().slice(2, 8)

        await this.redisService.set(`resister_captcha_${email}`, code, 5 * 30)

        await this.emailService.sendEmail({
            to: email,
            subject: '注册验证码',
            html: `<p>您的验证码为：${code}</p>`
        })
        return '发送成功'
    }

    //修改密码-发送验证码
    async update_password_captcha(email: string) {
        const code = Math.random().toString().slice(2, 8)

        await this.redisService.set(`update_password_captcha_${email}`, code, 10 * 60)

        await this.emailService.sendEmail({
            to: email,
            subject: '更改密码验证码',
            html: `<p>您的验证码为：${code}</p>`
        })
        return '发送成功'
    }

    //修改信息-发送验证码
    async update_user_captcha(email: string) {
        const code = Math.random().toString().slice(2, 8)

        await this.redisService.set(`update_user_captcha_${email}`, code, 10 * 60)

        await this.emailService.sendEmail({
            to: email,
            subject: '更新信息验证码',
            html: `<p>您的验证码为：${code}</p>`
        })
        return '发送成功'
    }

    //用户注册
    async register(user: RegisterUserDto) {
        const captcha = await this.redisService.get(`resister_captcha_${user.email}`)

        if (!captcha) throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST)

        if (captcha !== user.captcha) throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST)

        const foundUser = await this.userRepository.findOneBy({ username: user.username })

        if (foundUser) throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST)

        const newUser = new User()
        newUser.username = user.username
        newUser.nickName = user.nickName
        newUser.password = md5(user.password)
        newUser.email = user.email

        try {
            await this.userRepository.save(newUser)
            return '注册成功'
        } catch (e) {
            this.logger.error(e, UserService)
            return '注册失败'
        }
    }

    //用户登录
    async userLogin(loginUser: LoginUserDto, isAdmin: boolean) {
        const user = await this.userRepository.findOne({
            where: {
                username: loginUser.username,
                isAdmin
            },
            relations: ['roles', 'roles.permissions']
        })

        if (!user) throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST)

        if (user.password !== md5(loginUser.password)) throw new HttpException('密码错误', HttpStatus.BAD_REQUEST)

        const vo = new LoginUserVo()
        vo.userInfo = {
            id: user.id,
            username: user.username,
            nickName: user.nickName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            headPic: user.headPic,
            createTime: user.createTime,
            isAdmin: user.isAdmin,
            isFrozen: user.isFrozen,
            roles: user.roles.map(item => item.name),
            permissions: user.roles.reduce((curr, next) => {
                next.permissions.forEach(permission => {
                    if (curr.indexOf(permission) === -1) curr.push(permission)
                })
                return curr
            }, [])

        }

        return vo
    }

    //根据id查询用户所有信息
    async findOneById(userId: number, isAdmin: boolean) {
        const user = await this.userRepository.findOne({
            where: {
                id: userId,
                isAdmin
            },
            relations: ['roles', 'roles.permissions']
        })

        return {
            id: user.id,
            username: user.username,
            isAdmin: user.isAdmin,
            roles: user.roles.map(item => item.name),
            permissions: user.roles.reduce((curr, next) => {
                next.permissions.forEach(permission => {
                    if (curr.indexOf(permission) === -1) curr.push(permission)
                })
                return curr
            }, [])
        }
    }

    //获取用户详细信息
    async findUserDetailBuId(userId: number) {
        const user = await this.userRepository.findOne({
            where: {
                id: userId
            }
        })
        const vo = new UserInfoVo()
        vo.id = user.id
        vo.username = user.username
        vo.nickName = user.nickName
        vo.email = user.email
        vo.headPic = user.headPic
        vo.phoneNumber = user.phoneNumber
        vo.isFrozen = user.isFrozen
        vo.createTime = user.createTime

        return vo
    }

    //修改密码
    async updatePassword(passwordDto: UpdateUserPasswordDto) {
        const captcha = await this.redisService.get(`update_password_captcha_${passwordDto.email}`)

        if (!captcha) throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST)

        if (passwordDto.captcha !== captcha) throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST)

        const foundUser = await this.userRepository.findOneBy({ username: passwordDto.username })

        if (foundUser.email !== passwordDto.email) throw new HttpException('邮箱地址不正确', HttpStatus.BAD_REQUEST)

        foundUser.password = md5(passwordDto.password)

        try {
            await this.userRepository.save(foundUser)
            return '密码修改成功'
        } catch (e) {
            this.logger.error(e, UserService)
            return '密码修改失败'
        }
    }

    //用户修改信息
    async update(userId: number, updateUserDto: UpdateUserDto) {
        const foundUser = await this.userRepository.findOneBy({ id: userId })
        const captcha = await this.redisService.get(`update_user_captcha_${foundUser.email}`)

        if (!captcha) throw new HttpException('验证码失效', HttpStatus.BAD_REQUEST)

        if (captcha !== updateUserDto.captcha) throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST)


        if (updateUserDto.headPic) foundUser.headPic = updateUserDto.headPic
        if (updateUserDto.nickName) foundUser.nickName = updateUserDto.nickName
        if (updateUserDto.phoneNumber) foundUser.phoneNumber = updateUserDto.phoneNumber


        try {
            await this.userRepository.save(foundUser)
            return '信息修改成功'
        } catch (e) {
            this.logger.error(e, UserService)
            return '信息修改失败'
        }
    }

    //用户冻结
    async freezeUserById(id: number) {
        const user = await this.userRepository.findOneBy({ id })
        user.isFrozen = true

        try {
            await this.userRepository.save(user)
            return '操作成功'
        } catch (e) {
            this.logger.error(e, UserService)
            return '操作失败'
        }
    }

    //用户列表分页查询
    async findUserByPage(pageNum: number, pageSize: number, username: string, nickName: string, email: string) {
        const skipCount = (pageNum - 1) * pageSize
        const condition: Record<string, any> = {}

        if (username) condition.username = Like(`%${username}%`)
        if (nickName) condition.nickName = Like(`%${nickName}%`)
        if (email) condition.email = Like(`%${email}%`)


        const [users, totalCount] = await this.userRepository.findAndCount({
            select: ['id', 'username', 'nickName', 'email', 'phoneNumber', 'headPic', 'isFrozen', 'createTime'],
            skip: skipCount,
            take: pageSize,
            where: condition
        })

        const vo = new UserListVo()
        vo.users = users
        vo.totalCount = totalCount
        return vo
    }
}
