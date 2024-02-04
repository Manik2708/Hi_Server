import jwt from 'jwt-simple';
import { User } from '../Database/Models/user';
import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { BadRequestError, BadRequestTypes } from 'src/Errors/bad_request';
import { InternalServerError } from 'src/Errors/server_error';

export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token: any = req.header('token');
      if (
        token == null ||
        token == undefined ||
        token.toString().trim().length == 0
      ) {
        throw new BadRequestError(BadRequestTypes.TOKEN_NOT_FOUND);
      }
      if (token.toString().includes(' ')) {
        throw new BadRequestError(BadRequestTypes.INVALID_HEADER_TOKEN);
      }
      const decode = jwt.decode(token, 'token');
      const user = await User.findById(decode.id);
      if (!user) {
        throw new BadRequestError(BadRequestTypes.USER_DOESNOT_EXISTS);
      }
      req.id = user.id;
      res.locals.token = token;
      next();
    } catch (e: any) {
      throw new InternalServerError(e.toString());
    }
  }
}
