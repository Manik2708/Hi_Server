import { Global, Module } from '@nestjs/common';
import { InjectionTokens } from '../Constants/injection_tokens';
import { casClient, client, createQueue } from '../service_containers';
import { WebSocketServices } from './websocket_services';
import { WebSocketsGateWay } from '../websockets.gateway';
import { SendMessageToUserService } from './send_message_to_user';
import { UserOnlineServices } from './user_online_services';
import { CassandraDatabaseQueries } from '../Database/Cassandra/queries';
@Global()
@Module({
  providers: [
    CassandraDatabaseQueries,
    WebSocketServices,
    WebSocketsGateWay,
    SendMessageToUserService,
    UserOnlineServices,
    {
      provide: InjectionTokens.CasClient,
      useValue: casClient,
    },
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
  ],
  exports: [
    InjectionTokens.RedisClient,
    InjectionTokens.CreateQueue,
    WebSocketServices,
    InjectionTokens.CasClient,
    CassandraDatabaseQueries,
  ],
})
export class GlobalServiceModule {}
