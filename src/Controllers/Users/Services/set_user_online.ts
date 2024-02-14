import express from 'express';
import { BadRequestError, BadRequestTypes } from '../../../Errors/bad_request';
import { InternalServerError } from '../../../Errors/server_error';
import { userOnline } from '../../../Functions/set_user_online';
import { client } from '../../../service_containers';

export class SetUserOnline {
  setUserOnline = async (req: express.Request, res: express.Response) => {
    try {
      const userId = req.id;
      const socketId = req.header('socketId');
      if (userId == null) {
        throw new BadRequestError(BadRequestTypes.USER_DOESNOT_EXISTS);
      }
      userOnline(userId, socketId!, client);
      return res.status(200);
    } catch (e: any) {
      if (e instanceof BadRequestError) {
        return res.status(e.getStatus()).json({ message: e.message });
      }
      throw new InternalServerError(e.toString());
    }
  };
}
