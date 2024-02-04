import { Controller, Post, Req, Res } from "@nestjs/common";
import { CreateUserAccountService } from "./Services/create_account";
import express from "express";
import { UserLoginService } from "./Services/login";

@Controller('users')
export class UserController{
    constructor(
        private readonly createUserAccountService: CreateUserAccountService,
        private readonly userLoginService: UserLoginService
        ){}

    @Post('create-account-without-verification')
    async createUserAccount(@Req() req: express.Request, @Res() res: express.Response):Promise<void>{
       await this.createUserAccountService.createAccount(req, res);
    }

    @Post('login')
    async loginUser(@Req() req: express.Request, @Res() res: express.Response): Promise<void>{
        await this.userLoginService.userLogin(req, res);
    }

    

}