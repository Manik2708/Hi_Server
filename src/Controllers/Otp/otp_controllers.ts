import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import express from 'express';
import { OTPServices } from './Services/otp_services';

@Controller('otp')
export class OTPController {
  constructor(private readonly otpService: OTPServices) {}

  @Get('send-otp')
  async sendOtp(@Req() req: express.Request, @Res() res: express.Response) {
    await this.otpService.sendOtp(req, res);
  }

  @Post('verify-otp')
  async verifyOtp(@Req() req: express.Request, @Res() res: express.Response) {
    await this.otpService.verifyOtp(req, res);
  }
}
