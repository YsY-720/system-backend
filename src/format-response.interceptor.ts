import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import type { Response } from 'express';

@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const response: Response = context.switchToHttp().getResponse();

        return next.handle().pipe(map(data => {
            return {
                code: response.statusCode,
                message: 'success',
                data
            };
        }));
    }
}
