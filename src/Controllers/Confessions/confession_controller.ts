import { Controller, Post, Req, Res } from '@nestjs/common';
import express from 'express';
import { ConfessionServices } from './Services/confession_services';

@Controller('confessions')
export class ConfessionsController {
  constructor(private readonly confessionServices: ConfessionServices) {}

  @Post('send-confession')
  async sendConfessionToCrush(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    await this.confessionServices.sendConfessionToUser(req, res);
  }

  @Post('reject-confession')
  async rejectConfession(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    await this.confessionServices.rejectConfession(req, res);
  }
}
