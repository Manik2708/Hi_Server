import { Controller, Post, Req, Res } from '@nestjs/common';
import express from 'express';
import { ConfessionServices } from './Services/confession_services';
import { ControllerPaths } from '../../Constants/contoller_paths';
import { ConfessionRoutes } from '../../Constants/route_paths';
import { InternalServerError } from '../../Errors/server_error';
import { ThrowError } from '../../Errors/throw_error';

@Controller(ControllerPaths.CONFESSION_CONTROLLER)
export class ConfessionsController {
  constructor(private readonly confessionServices: ConfessionServices) {}

  @Post(ConfessionRoutes.SEND_CONFESSION)
  async sendConfessionToCrush(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      const {
        sender_id,
        anonymous_id,
        crush_id,
        confession,
        time,
        crush_name,
      } = req.body;
      const confessionDb = await this.confessionServices.sendConfessionToUser(
        sender_id,
        anonymous_id,
        crush_id,
        confession,
        time,
        crush_name,
      );
      return res.status(400).json(confessionDb);
    } catch (error) {
      if (error instanceof InternalServerError) {
        throw error;
      } else {
        throw Error('Unknown error');
      }
    }
  }

  @Post(ConfessionRoutes.REJECT_CONFESSION)
  async rejectConfession(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      const {
        sender_id,
        sending_time,
        crush_id,
        time,
        reading_time,
        confession_id,
      } = req.body;
      const ifRejected = await this.confessionServices.rejectConfession(
        sender_id,
        sending_time,
        crush_id,
        time,
        reading_time,
        confession_id,
      );
      return res.status(200).json(ifRejected);
    } catch (error) {
      if (error instanceof InternalServerError) {
        throw error;
      } else {
        throw Error('Unknown error');
      }
    }
  }

  @Post(ConfessionRoutes.READ_CONFESSION)
  async readConfession(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      const {
        confession_id,
        sender_id,
        anonymous_id,
        crush_id,
        confession,
        sending_time,
        crush_name,
        reading_time,
      } = req.body;
      await this.confessionServices.readConfession(
        confession_id,
        sender_id,
        anonymous_id,
        crush_id,
        confession,
        sending_time,
        crush_name,
        reading_time,
      );
      return res.status(200).json(true);
    } catch (error) {
      throw new ThrowError(error, res);
    }
  }

  @Post(ConfessionRoutes.ACCEPT_CONFESSION)
  async acceptConfession(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      const {
        sender_id,
        sending_time,
        crush_id,
        time,
        reading_time,
        confession_id,
        crush_name,
        anonymous_id,
      } = req.body;
      const chat = await this.confessionServices.acceptConfession(
        sender_id,
        sending_time,
        crush_id,
        time,
        reading_time,
        confession_id,
        crush_name,
        anonymous_id,
      );
      const { chat_id, ...chat_without_id } = chat;
      const updated_chat = {
        chat_id: chat_id.toString(),
        ...chat_without_id,
      };
      return res.status(200).json(updated_chat);
    } catch (error) {
      throw new ThrowError(error, res);
    }
  }
}
