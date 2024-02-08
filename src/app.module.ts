import { Module } from '@nestjs/common';
import { InjectionTokens } from './Constants/injection_tokens';
import { casClient, client, createQueue} from './service_containers';
import { SendMessageToUserService } from './Services/send_message_to_user';
import { CassandraDatabaseQueries } from './Database/Cassandra/queries';
import { ConfessionsModule } from './Controllers/Confessions/confession.module';
import { OTPModule } from './Controllers/Otp/otp.module';
import { UserModule } from './Controllers/Users/user.module';
import { WebSocketServices } from './Services/websocket_services';
import { WebSocketsGateWay } from './websockets.gateway';

@Module({
  providers: [
    SendMessageToUserService,
    CassandraDatabaseQueries,
    WebSocketServices,
    WebSocketsGateWay,
    {
      provide: InjectionTokens.RedisClient,
      useFactory: async()=>{
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
  imports:[
    ConfessionsModule,
    OTPModule, 
    UserModule
  ]
})
export class AppModule {}
