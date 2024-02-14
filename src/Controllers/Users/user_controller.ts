import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { CreateUserAccountService } from './Services/create_account';
import express from 'express';
import { UserLoginService } from './Services/login';
import { ChangeEmailService } from './Services/change_email';
import { SetUserOnline } from './Services/set_user_online';
import { UserRoutes } from 'src/Constants/route_paths';
import { ControllerPaths } from 'src/Constants/contoller_paths';

@Controller(ControllerPaths.USER_CONTROLLER)
export class UserController {
  constructor(
    private readonly createUserAccountService: CreateUserAccountService,
    private readonly userLoginService: UserLoginService,
    private readonly changeEmailService: ChangeEmailService,
    private readonly setUserOnlineService: SetUserOnline,
  ) {}

  @Post(UserRoutes.CREATE_ACCOUNT_WITHOUT_VERIFICATION)
  async createUserAccount(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    await this.createUserAccountService.createAccount(req, res);
  }

  @Post(UserRoutes.LOGIN)
  async loginUser(@Req() req: express.Request, @Res() res: express.Response) {
    await this.userLoginService.userLogin(req, res);
  }

  @Post(UserRoutes.CHANGE_EMAIL)
  async changeEmail(@Req() req: express.Request, @Res() res: express.Response) {
    await this.changeEmailService.changeEmail(req, res);
  }

  @Get(UserRoutes.SET_USER_ONLINE)
  async setUserOnline(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    await this.setUserOnlineService.setUserOnline(req, res);
  }
}
