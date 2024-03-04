import { Global, Module } from '@nestjs/common';
import { InjectionTokens } from '../Constants/injection_tokens';
import { client, createQueue } from '../service_containers';
import { WebSocketServices } from './websocket_services';
import { WebSocketsGateWay } from '../websockets.gateway';
import { SendMessageToUserService } from './send_message_to_user';
@Global()
@Module({
  providers: [
    WebSocketServices,
    WebSocketsGateWay,
    SendMessageToUserService,
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
  exports: [InjectionTokens.RedisClient, InjectionTokens.CreateQueue],
})
export class GlobalServiceModule {}
