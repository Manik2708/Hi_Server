import { User } from '../../../Database/Models/user';
import bcrypt from 'bcryptjs';
import jsonwt from 'jwt-simple';
import mongoose from 'mongoose';
import { BadRequestError, BadRequestTypes } from '../../../Errors/bad_request';
import { InternalServerError } from '../../../Errors/server_error';
import express from 'express';

export class CreateUserAccountService {
  createAccount = async (
    req: express.Request,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const anonymousId = new mongoose.mongo.ObjectId();
      const email = req.body.email;
      const user = await User.findOne({ email });
      if (user != null) {
        throw new BadRequestError(BadRequestTypes.USER_ALREADY_EXISTS);
      }
      const username = req.body.username;
      const ifUserNameAvailable = await User.findOne({ username });
      if (ifUserNameAvailable != null) {
        throw new BadRequestError(BadRequestTypes.USERNAME_ALREADY_EXISTS);
      }
      const hashedPassword = await bcrypt.hash(req.body.password, 8);
      let createUser = new User({
        name: req.body.name,
        email: email,
        password: hashedPassword,
        username: username,
        dob: req.body.dob,
        isEmailVerified: req.body.isEmailVerified,
        anonymousId: anonymousId,
      });
      createUser = await createUser.save();
      const token = jsonwt.encode({ id: createUser._id }, 'token');
      return res.status(200).json({
        token: token,
        ...createUser._doc,
      });
    } catch (e: any) {
      if (e instanceof BadRequestError) {
        return res.status(e.getStatus()).json({ message: e.message });
      }
      throw new InternalServerError(e.toString());
    }
  };
}
