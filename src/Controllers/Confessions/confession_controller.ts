import { Controller, Post, Req, Res } from '@nestjs/common';
import express from 'express';
import { ConfessionServices } from './Services/confession_services';
import { ControllerPaths } from 'src/Constants/contoller_paths';
import { ConfessionRoutes } from 'src/Constants/route_paths';

@Controller(ControllerPaths.CONFESSION_CONTROLLER)
export class ConfessionsController {
  constructor(private readonly confessionServices: ConfessionServices) {}

  @Post(ConfessionRoutes.SEND_CONFESSION)
  async sendConfessionToCrush(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    await this.confessionServices.sendConfessionToUser(req, res);
  }

  @Post(ConfessionRoutes.REJECT_CONFESSION)
  async rejectConfession(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    await this.confessionServices.rejectConfession(req, res);
  }
}
