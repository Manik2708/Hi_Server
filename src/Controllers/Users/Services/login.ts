import express from 'express';
import { User } from '../../../Database/Models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jwt-simple';
import { BadRequestError, BadRequestTypes } from '../../../Errors/bad_request';
import { InternalServerError } from '../../../Errors/server_error';
export class UserLoginService {
  userLogin = async (req: express.Request, res: express.Response) => {
    try {
      const { identify, password } = req.body;
      const user = await User.findOne(
        { email: identify },
        { sentConfessions: 0, recievedConfessions: 0 },
      );
      if (user == null) {
        throw new BadRequestError(BadRequestTypes.USER_DOESNOT_EXISTS);
      }

      const ifCorrectPassword = await bcrypt.compare(
        password,
        user.password.toString(),
      );
      if (!ifCorrectPassword) {
        throw new BadRequestError(BadRequestTypes.WRONG_PASSWORD);
      }
      const token = jwt.encode({ id: user._id }, 'token');
      return res.status(200).json({ token: token, ...user._doc });
    } catch (e: any) {
      if (e instanceof BadRequestError) {
        return res.status(e.getStatus()).json({ message: e.message });
      }
      throw new InternalServerError(e.toString());
    }
  };
}
