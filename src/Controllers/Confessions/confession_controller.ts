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
        senderId,
        senderAnonymousId,
        crushId,
        confession,
        time,
        crushName,
      } = req.body;
      const confessionDb = await this.confessionServices.sendConfessionToUser(
        senderId,
        senderAnonymousId,
        crushId,
        confession,
        time,
        crushName,
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
        senderId,
        sendingTime,
        crushId,
        time,
        readingTime,
        confessionId,
      } = req.body;
      const ifRejected = await this.confessionServices.rejectConfession(
        senderId,
        sendingTime,
        crushId,
        time,
        readingTime,
        confessionId,
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
        confessionId,
        senderId,
        senderAnonymousId,
        crushId,
        confession,
        sendingTime,
        crushName,
        readingTime,
      } = req.body;
      await this.confessionServices.readConfession(
        confessionId,
        senderId,
        senderAnonymousId,
        crushId,
        confession,
        sendingTime,
        crushName,
        readingTime,
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
        senderId,
        sendingTime,
        crushId,
        time,
        readingTime,
        confessionId,
        crushName,
        anonymousId,
      } = req.body;
      const chat = await this.confessionServices.acceptConfession(
        senderId,
        sendingTime,
        crushId,
        time,
        readingTime,
        confessionId,
        crushName,
        anonymousId,
      );
      return res.status(200).json(chat);
    } catch (error) {
      throw new ThrowError(error, res);
    }
  }
}
