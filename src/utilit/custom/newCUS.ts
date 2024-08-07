import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(message: string) {
    super({
      errorsMessages: [{ message, field: 'code' }],
    }, HttpStatus.BAD_REQUEST);
  }
}
