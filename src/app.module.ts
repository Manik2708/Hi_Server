import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { InjectionTokens } from './Constants/injection_tokens';
import { casClient, client, createQueue } from './service_containers';
import { SendMessageToUserService } from './Services/send_message_to_user';
import { CassandraDatabaseQueries } from './Database/Cassandra/queries';
import { ConfessionsModule } from './Controllers/Confessions/confession.module';
import { OTPModule } from './Controllers/Otp/otp.module';
import { UserModule } from './Controllers/Users/user.module';
import { WebSocketServices } from './Services/websocket_services';
import { WebSocketsGateWay } from './websockets.gateway';
import { AuthMiddleware } from './Middlewares/user';
import { ConfessionsController } from './Controllers/Confessions/confession_controller';
import { OTPController } from './Controllers/Otp/otp_controllers';
import { UserController } from './Controllers/Users/user_controller';
import { UserRoutes } from './Constants/route_paths';
import { ControllerPaths } from './Constants/contoller_paths';

@Module({
  providers: [
    SendMessageToUserService,
    CassandraDatabaseQueries,
    WebSocketServices,
    WebSocketsGateWay,
    {
      provide: InjectionTokens.RedisClient,
      useFactory: async () => {
        await client.connect();
        return client;
      },
    },
    {
      provide: InjectionTokens.CreateQueue,
      useValue: createQueue,
    },
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
