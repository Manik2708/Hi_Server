import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import express from 'express';
import { OTPServices } from './Services/otp_services';
import { ControllerPaths } from '../../Constants/contoller_paths';
import { OTPRoutes } from '../../Constants/route_paths';

@Controller(ControllerPaths.OTP_CONTROLLER)
export class OTPController {
  constructor(private readonly otpService: OTPServices) {}

  @Get(OTPRoutes.SEND_OTP)
  async sendOtp(@Req() req: express.Request, @Res() res: express.Response) {
    await this.otpService.sendOtp(req, res);
  }

  @Post(OTPRoutes.VERIFY_OTP)
  async verifyOtp(@Req() req: express.Request, @Res() res: express.Response) {
    await this.otpService.verifyOtp(req, res);
  }
}
