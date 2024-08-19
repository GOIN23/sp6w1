import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';

// https://docs.nestjs.com/exception-filters

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();


    if (status === HttpStatus.BAD_REQUEST) {
      const errorsResponse = {
        errorsMessages: [],
      };

      const responseBody: any = exception.getResponse();

      if (Array.isArray(responseBody.message)) {
        responseBody.message.forEach((e) =>
          errorsResponse.errorsMessages.push(e),
        );
      } else {
        errorsResponse.errorsMessages.push(responseBody.message);
      }

      response.status(status).json(errorsResponse);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }



  }
}




@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();


    if (exception instanceof HttpException) {
      if (exception.getStatus() === HttpStatus.BAD_REQUEST) {
        const errorsResponse = {
          errorsMessages: [],
        };

        const responseBody: any = exception.getResponse();

        if (Array.isArray(responseBody.message)) {
          responseBody.message.forEach((e) =>
            errorsResponse.errorsMessages.push(e),
          );
        } else {
          errorsResponse.errorsMessages.push(responseBody.message);
        }

        response.status(exception.getStatus()).json(errorsResponse);
      } else {
        response.status(exception.getStatus()).send({
          statusCode: exception.getStatus(),
          path: request.url,
        });

      }
    } else if (exception instanceof Error) {
      console.log({
        message: (exception as Error).message,
        stack: (exception as Error).stack, // Добавляем стек вызовов
      })
      response.status(500).send("Опс... Сервер умер ");
    }
  }
}










@Catch(Error)
export class HttpErrorFilter implements ExceptionFilter {

  catch(exception: any, host: ArgumentsHost) {
    debugger
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();


    console.log({
      message: (exception as Error).message,
      stack: (exception as Error).stack, // Добавляем стек вызовов
    })
    response.status(500).send("Опс... Сервер умер ");
  }


}
