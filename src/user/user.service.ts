import {HttpException, HttpStatus, Inject, Injectable, Logger} from '@nestjs/common';
import {InjectEntityManager, InjectRepository} from '@nestjs/typeorm';
import {User} from './entities/user.entity';
import {Repository} from 'typeorm';
import {RegisterUserDto} from './dto/register-user.dto';
import {RedisService} from 'src/redis/redis.service';
import {md5} from 'src/utils';
import {EmailService} from 'src/email/email.service';
import {Role} from "./entities/role.entity";
import {Permission} from "./entities/permission.entity";

@Injectable()
export class UserService {
    private logger = new Logger();

    @InjectRepository(User)
    private readonly userRepository: Repository<User>;

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>;

    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>;

    @Inject(RedisService)
    private readonly redisService: RedisService;

    @Inject(EmailService)
    private readonly emailService: EmailService;

    async register(user: RegisterUserDto) {
        const captcha = await this.redisService.get(`captcha_${user.email}`);

        if (!captcha) throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);

        if (captcha !== user.captcha) throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);

        const foundUser = await this.userRepository.findOneBy({username: user.username});

        if (foundUser) throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);

        const newUser = new User();
        newUser.username = user.username;
        newUser.nickName = user.nickName;
        newUser.password = md5(user.password);
        newUser.email = user.email;

        try {
            await this.userRepository.save(newUser);
            return '注册成功';
        } catch (e) {
            this.logger.error(e, UserService);
            return '注册失败';
        }
    }


    async captcha(email: string) {
        const code = Math.random().toString().slice(2, 8);

        await this.redisService.set(`captcha_${email}`, code, 5 * 30);

        await this.emailService.sendEmail({
            to: email,
            subject: '注册验证码',
            html: `<p>您的验证码为：${code}</p>`
        });
        return '发送成功';
    }
}
