import * as crypto from 'crypto'
import * as multer from 'multer'
import * as fs from 'fs'

import { BadRequestException, ParseIntPipe } from '@nestjs/common'

export function md5(str: string) {
    const hash = crypto.createHash('md5')
    hash.update(str)
    return hash.digest('hex')
}

export function generateParseIntPipe(name) {
    return new ParseIntPipe({
        exceptionFactory() {
            throw new BadRequestException('name' + '应为数字')
        }
    })
}


export function fileStorage() {
    return multer.diskStorage({
        destination: function (req, file, callback) {
            try {
                fs.mkdirSync('uploads')
            } catch (e) { }
            callback(null, 'uploads')
        },
        filename: function (req, file, callback) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + file.originalname
            callback(null, uniqueSuffix)
        }
    })
} 
