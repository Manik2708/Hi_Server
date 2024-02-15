import jwt from 'jwt-simple';
import { User } from '../Database/Models/user';
import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { BadRequestError, BadRequestTypes } from '../Errors/bad_request';
import { InternalServerError } from '../Errors/server_error';
import {
  UnathorizedErrorTypes,
  UnathorizedRequestError,
} from '../Errors/unauthorised_request';

/**
 * @param header: token: A json webtoken, for authorization of the user!
 */

export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token: any = req.header('token');
      if (
        token == null ||
        token == undefined ||
        token.toString().trim().length == 0
      ) {
        throw new UnathorizedRequestError(
          UnathorizedErrorTypes.TOKEN_NOT_FOUND,
        );
      }
      if (token.toString().includes(' ')) {
        throw new UnathorizedRequestError(
          UnathorizedErrorTypes.INVALID_HEADER_TOKEN,
        );
      }
      const decode = jwt.decode(token, 'token');
      const user = await User.findById(decode.id);
      if (!user) {
        throw new BadRequestError(BadRequestTypes.USER_DOESNOT_EXISTS);
      }
      req.id = user.id;
      res.locals.token = token;
      return next();
    } catch (e: any) {
      if (e instanceof BadRequestError || UnathorizedRequestError) {
        return res.status(e.getStatus()).json({ message: e.message });
      }
      throw new InternalServerError(e.toString());
    }
  }
}
