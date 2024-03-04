import { Controller, Post, Req, Res } from '@nestjs/common';
import express from 'express';
import { ConfessionServices } from './Services/confession_services';
import { ControllerPaths } from 'src/Constants/contoller_paths';
import { ConfessionRoutes } from 'src/Constants/route_paths';
import { InternalServerError } from 'src/Errors/server_error';

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
    await this.confessionServices.rejectConfession(req, res);
  }
}
