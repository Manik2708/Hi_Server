import { Global, Module } from '@nestjs/common';
import { InjectionTokens } from '../Constants/injection_tokens';
import {
  casClient,
  client,
  createQueue,
  GRPCClientAddress,
} from '../service_containers';
import { SendMessageToUserService } from './send_message_to_user';
import { UserOnlineServices } from './user_online_services';
import { CassandraDatabaseQueries } from '../Database/Cassandra/queries';
@Global()
@Module({
  providers: [
    CassandraDatabaseQueries,
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
      provide: InjectionTokens.GRPClientAddress,
      useValue: GRPCClientAddress,
    },
    {
      provide: InjectionTokens.CreateQueue,
      useValue: createQueue,
    },
  ],
  exports: [
    InjectionTokens.RedisClient,
    InjectionTokens.GRPClientAddress,
    InjectionTokens.CasClient,
    CassandraDatabaseQueries,
    SendMessageToUserService,
  ],
})
export class GlobalServiceModule {}
