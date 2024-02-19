import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import {Role} from './role.entity';

@Entity({name: 'users'})
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 50,
        comment: '用户名'
    })
    username: string;

    @Column({
        length: 100,
        comment: '密码'
    })
    password: string;

    @Column({
        name: 'nick_name',
        length: 10,
        comment: '昵称'
    })
    nickName: string;

    @Column({
        comment: '邮箱',
        length: 50
    })
    email: string;

    @Column({
        name: 'head_pic',
        length: 100,
        comment: '头像',
        nullable: true,
    })
    headPic: string;

    @Column({
        name: 'phone_number',
        length: 20,
        comment: '手机号',
        nullable: true,
    })
    phoneNumber: string;

    @Column({
        name: 'is_frozen',
        default: false,
        comment: '是否被冻结'
    })
    isFrozen: boolean;

    @Column({
        name: 'is_admin',
        default: false,
        comment: '是否是管理员'
    })
    isAdmin: boolean;

    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: Date;

    @UpdateDateColumn({
        name: 'update_time',
        comment: '更新时间'
    })
    updateTime: Date;

    @JoinTable({name: 'user_role'})
    @ManyToMany(() => Role)
    roles: Role[];
}

