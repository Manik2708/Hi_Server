import express from 'express';
import { User } from '../../../Database/Models/user';
import bcrypt from 'bcryptjs';
import { BadRequestError, BadRequestTypes } from '../../../Errors/bad_request';
import { InternalServerError } from '../../../Errors/server_error';

export class ChangeEmailService {
  changeEmail = async (req: express.Request, res: express.Response) => {
    try {
      const { password, email } = req.body;
      if (email == undefined || null) {
        throw new BadRequestError(BadRequestTypes.EMAIL_NOT_ENTERED);
      }
      if (password == undefined || null) {
        throw new BadRequestError(BadRequestTypes.PASSWORD_NOT_ENTERED);
      }
      const emailRegex: RegExp =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestError(BadRequestTypes.INVALID_EMAIL);
      }
      const user = await User.findById(req.id);
      const ifCorrectPassword = await bcrypt.compare(
        password,
        user!.password.toString(),
      );
      if (!ifCorrectPassword) {
        throw new BadRequestError(BadRequestTypes.WRONG_PASSWORD);
      }
      const updatedUser = await User.findByIdAndUpdate(
        req.id,
        { email: email },
        { new: true },
      );
      res.json(true);
    } catch (e: any) {
      throw new InternalServerError(e.toString());
    }
  };
}
