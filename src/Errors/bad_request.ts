import { HttpException, HttpStatus } from '@nestjs/common';

export class BadRequestError extends HttpException {
  constructor(reqType: BadRequestTypes) {
    let message: string;
    switch (reqType) {
      case BadRequestTypes.USER_ALREADY_EXISTS:
        message = 'User with same Email or Phone exists. Please Login!';
        break;
      case BadRequestTypes.USERNAME_ALREADY_EXISTS:
        message = 'Username not available, kindly pick a new one';
        break;
      case BadRequestTypes.USER_DOESNOT_EXISTS:
        message = 'No user exists with this username or email address';
        break;
      case BadRequestTypes.WRONG_PASSWORD:
        message = 'Wrong password, Try again!';
        break;
      case BadRequestTypes.OTP_OR_TOKEN_NOT_PROVIDED:
        message = 'OTP or token is not provided';
        break;
      case BadRequestTypes.INVALID_OTP:
        message = 'Invalid OTP';
        break;
      case BadRequestTypes.OTP_VERIFICATION_FAILED:
        message = 'Verification failed';
        break;
      case BadRequestTypes.EMAIL_NOT_ENTERED:
        message = 'Please Enter Email';
        break;
      case BadRequestTypes.PASSWORD_NOT_ENTERED:
        message = 'Please Enter Password';
        break;
      case BadRequestTypes.INVALID_EMAIL:
        message = 'Invalid email';
        break;
      case BadRequestTypes.USER_WITH_TOKEN_DOESNT_EXIST:
        message = `User with this token doesn't exist`;
        break;
      default:
        message = 'Unknown Bad Request';
        break;
    }
    super(
      {
        message: message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export enum BadRequestTypes {
  USER_ALREADY_EXISTS,
  USERNAME_ALREADY_EXISTS,
  USER_DOESNOT_EXISTS,
  WRONG_PASSWORD,
  OTP_OR_TOKEN_NOT_PROVIDED,
  INVALID_OTP,
  OTP_VERIFICATION_FAILED,
  PASSWORD_NOT_ENTERED,
  EMAIL_NOT_ENTERED,
  INVALID_EMAIL,
  USER_WITH_TOKEN_DOESNT_EXIST,
}
