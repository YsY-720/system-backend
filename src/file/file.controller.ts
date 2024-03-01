import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileService } from './file.service'
import { FileInterceptor } from '@nestjs/platform-express'
import * as path from 'path'
import { fileStorage } from 'src/utils'

@Controller('file')
export class FileController {
    constructor(private readonly fileService: FileService) { }


    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        dest: 'uploads',
        limits: {
            fileSize: 1024 * 1024 * 3
        },
        storage: fileStorage(),
        fileFilter(req, file, callback) {
            const extname = path.extname(file.originalname)
            if (['.png', '.jpg', '.gif', '.jpeg'].includes(extname)) {
                callback(null, true)
            } else {
                callback(new BadRequestException('只能上传图片文件'), false)
            }
        }
    }))
    async upload(@UploadedFile() file: Express.Multer.File) {
        return file.path
    }

}
