import { Module } from '@nestjs/common';
import { ChangeEmailService } from './Services/change_email';
import { CreateUserAccountService } from './Services/create_account';
import { UserLoginService } from './Services/login';
import { SetUserOnline } from './Services/set_user_online';
import { UserController } from './user_controller';

@Module({
    providers:[
        ChangeEmailService,
        CreateUserAccountService,
        UserLoginService,
        SetUserOnline
    ],
    controllers:[
        UserController
    ]
})

export class UserModule{}