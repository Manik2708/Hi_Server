import { Controller, Get, Req, Res } from '@nestjs/common';
import express from 'express';

@Controller('health-check')
export class GlobalControllers {
  @Get('container')
  async containerHealthCheck(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    return res.status(200).send('Ok');
  }
}
