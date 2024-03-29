import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { Client } from 'minio';

@Injectable()
export class FileService {
    private minioClient: Client;
    private logger = new Logger();

    constructor(private readonly configService: ConfigService) {
        this.minioClient = new Client({
            endPoint: configService.get('OSS_HOST'),
            useSSL: false,
            port: +configService.get('OSS_PORT'),
            accessKey: configService.get('OSS_USER_NAME'),
            secretKey: configService.get('OSS_USER_PASSWORD'),
        });
    }

    async put(fileName: string, path: string) {
        return await this.minioClient.fPutObject(
            this.configService.get('OSS_HOST_BUCKET'),
            fileName,
            path,
            (err: any) => {
                if (err) return this.logger.error(err, FileService);
                fs.unlink(path, err => {
                    if (err) this.logger.error(err, FileService);
                });
                return fileName;
            }
        );
    }

    async uploadFile(fileName: string, path: string) {
        return await this.put(fileName, path);
    }

}
