import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CassandraDatabaseQueries } from './Database/Cassandra/queries';
import { ConfessionsModule } from './Controllers/Confessions/confession.module';
import { OTPModule } from './Controllers/Otp/otp.module';
import { UserModule } from './Controllers/Users/user.module';
import { AuthMiddleware } from './Middlewares/user';
import { ConfessionsController } from './Controllers/Confessions/confession_controller';
import { OTPController } from './Controllers/Otp/otp_controllers';
import { UserController } from './Controllers/Users/user_controller';
import { UserRoutes } from './Constants/route_paths';
import { ControllerPaths } from './Constants/contoller_paths';
import { InjectionTokens } from './Constants/injection_tokens';
import { casClient } from './service_containers';

@Module({
  providers: [
    CassandraDatabaseQueries,
    {
      provide: InjectionTokens.CasClient,
      useValue: casClient,
    },
  ],
  imports: [ConfessionsModule, OTPModule, UserModule],
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
      )
      .forRoutes(ConfessionsController, OTPController, UserController);
  }
}
