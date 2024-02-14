import { HttpException, HttpStatus } from '@nestjs/common';

export class UnathorizedRequestError extends HttpException {
  constructor(reqType: UnathorizedErrorTypes) {
    let message: string;
    switch (reqType) {
      case UnathorizedErrorTypes.INVALID_HEADER_TOKEN:
        message = 'Invalid Token';
        break;
      case UnathorizedErrorTypes.TOKEN_NOT_FOUND:
        message = 'Token not found';
        break;
      default:
        message = 'Unknown unathorized error';
    }
    super(
      {
        message: message,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export enum UnathorizedErrorTypes {
  INVALID_HEADER_TOKEN,
  TOKEN_NOT_FOUND,
}
