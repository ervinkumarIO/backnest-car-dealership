import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exception.message || 'Internal server error',
    };

    // Add validation errors if they exist
    const exceptionResponse = exception.getResponse() as {
      message?: string | string[];
    };
    if (typeof exceptionResponse === 'object' && exceptionResponse.message) {
      errorResponse.message = Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message.join(', ')
        : exceptionResponse.message;
    }

    response.status(status).json(errorResponse);
  }
}
