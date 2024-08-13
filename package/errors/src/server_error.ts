import { HttpException, HttpStatus } from '@nestjs/common';

export class InternalServerError extends HttpException {
  constructor(msg: string) {
    super(
      {
        message: msg,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
