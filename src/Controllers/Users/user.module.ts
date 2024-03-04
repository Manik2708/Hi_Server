import { Module } from '@nestjs/common';
import { ChangeEmailService } from './Services/change_email';
import { CreateUserAccountService } from './Services/create_account';
import { UserLoginService } from './Services/login';
import { UserController } from './user_controller';

@Module({
  providers: [ChangeEmailService, CreateUserAccountService, UserLoginService],
  controllers: [UserController],
})
export class UserModule {}
