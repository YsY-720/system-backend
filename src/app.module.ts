import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { Role } from './user/entities/role.entity';
import { Permission } from './user/entities/permission.entity';
import { EmailModule } from './email/email.module';
import { RedisModule } from './redis/redis.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoginGuard } from './login.guard';
import { PermissionGuard } from './permission.guard';
import { FormatResponseInterceptor } from './format-response.interceptor';
import { InvokeRecordInterceptor } from './invoke-record.interceptor';
import { UnLoginFilter } from './unLogin.filter';
import { CustomExceptionFilter } from './custom-exception.filter';
import { FileModule } from './file/file.module';
import { MeetingRoomModule } from './meeting-room/meeting-room.module';
import { MeetingRoom } from './meeting-room/entities/meeting-room.entity';
import { BookingModule } from './booking/booking.module';
import { Booking } from './booking/entities/booking.entity';

import * as path from 'path';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory(configService: ConfigService) {
                return {
                    type: 'mysql',
                    host: configService.get('MYSQL_SERVER_HOST'),
                    port: configService.get('MYSQL_SERVER_PORT'),
                    username: configService.get('MYSQL_SERVER_USERNAME'),
                    password: configService.get('MYSQL_SERVER_PASSWORD'),
                    database: configService.get('MYSQL_SERVER_DATABASE'),
                    synchronize: true,
                    logging: true,
                    entities: [
                        User, Role, Permission, MeetingRoom, Booking
                    ],
                    poolSize: 10,
                    connectorPackage: 'mysql2',
                    extra: {
                        authPlugin: 'sha256_password',
                    }
                };
            },
            inject: [ConfigService]
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: path.join(__dirname, '.env')
        }),
        JwtModule.registerAsync({
            global: true,
            useFactory(configService: ConfigService) {
                return {
                    secret: configService.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: '30m'
                    }
                };
            },
            inject: [ConfigService]
        }),
        UserModule,
        EmailModule,
        RedisModule,
        FileModule,
        MeetingRoomModule,
        BookingModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: LoginGuard
        },
        {
            provide: APP_GUARD,
            useClass: PermissionGuard
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: FormatResponseInterceptor
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: InvokeRecordInterceptor
        },
        {
            provide: APP_FILTER,
            useClass: UnLoginFilter
        },
        {
            provide: APP_FILTER,
            useClass: CustomExceptionFilter
        }
    ],
})
export class AppModule {
}
