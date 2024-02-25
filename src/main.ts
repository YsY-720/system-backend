import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe());

    const config = new DocumentBuilder()
        .setTitle('会议室预定系统')
        .setDescription('api 接口文档')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', description: '基于 JWT 的认证' })
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-doc', app, document);

    await app.listen(3000);
}

bootstrap();
