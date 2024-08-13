import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfessionsModule } from './Controllers/Confessions/confession.module';
import { OTPModule } from './Controllers/Otp/otp.module';
import { UserModule } from './Controllers/Users/user.module';
import { AuthMiddleware } from './Middlewares/user';
import { ConfessionsController } from './Controllers/Confessions/confession_controller';
import { OTPController } from './Controllers/Otp/otp_controllers';
import { UserController } from './Controllers/Users/user_controller';
import { UserRoutes } from '../package/constants/src/route_paths';
import { ControllerPaths } from '../package/constants/src/contoller_paths';
import { ChatsModule } from './Controllers/Chats/chats.module';
import { RetrieveDataModule } from './Controllers/RetrieveData/retrieve_data.module';
import { GlobalControllers } from './global_controller';

@Module({
  imports: [
    ConfessionsModule,
    OTPModule,
    UserModule,
    ChatsModule,
    RetrieveDataModule,
  ],
  controllers: [GlobalControllers],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        {
          path:
            ControllerPaths.USER_CONTROLLER +
            '/' +
            UserRoutes.CREATE_ACCOUNT_WITHOUT_VERIFICATION,
          method: RequestMethod.POST,
        },
        {
          path: ControllerPaths.USER_CONTROLLER + '/' + UserRoutes.LOGIN,
          method: RequestMethod.POST,
        },
        {
          path: '/health-check/container',
          method: RequestMethod.GET,
        },
      )
      .forRoutes(ConfessionsController, OTPController, UserController);
  }
}
