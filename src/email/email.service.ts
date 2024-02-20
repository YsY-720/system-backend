import { Inject, Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
    transporter: Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = createTransport({
            host: configService.get('NODEMAILER_HOST'),
            port: configService.get('NODEMAILER_PORT'),
            secure: false,
            auth: {
                user: configService.get('NODEMAILER_AUTH_USER'),
                pass: configService.get('NODEMAILER_AUTH_PASS')
            }
        });
    }

    async sendEmail({ to, subject, html }) {
        await this.transporter.sendMail({
            from: {
                name: '会议室预定系统',
                address: '2285683024@qq.com'
            },
            to,
            subject,
            html
        });
    }
}
