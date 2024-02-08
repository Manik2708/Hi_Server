import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { CreateUserAccountService } from './Services/create_account';
import express from 'express';
import { UserLoginService } from './Services/login';
import { ChangeEmailService } from './Services/change_email';
import { SetUserOnline } from './Services/set_user_online';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserAccountService: CreateUserAccountService,
    private readonly userLoginService: UserLoginService,
    private readonly changeEmailService: ChangeEmailService, 
    private readonly setUserOnlineService: SetUserOnline
  ) {}

  @Post('create-account-without-verification')
  async createUserAccount(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ){
    await this.createUserAccountService.createAccount(req, res);
  }

  @Post('login')
  async loginUser(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ){
    await this.userLoginService.userLogin(req, res);
  }

  @Post('change-email')
  async changeEmail(@Req() req: express.Request, @Res() res: express.Response){
    await this.changeEmailService.changeEmail(req, res);
  }

  @Get('set-user-online')
  async setUserOnline(@Req() req: express.Request, @Res() res: express.Response){
    await this.setUserOnlineService.setUserOnline(req, res);
  }

}
