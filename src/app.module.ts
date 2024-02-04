import { Module } from '@nestjs/common';
import { InjectionTokens } from './Constants/injection_tokens';
import { casClient, client, createQueue, ioServer } from './service_containers';

@Module({
  providers: [
    {
      provide: InjectionTokens.RedisClient,
      useValue: client,
    },
    {
      provide: InjectionTokens.CreateQueue,
      useValue: createQueue,
    },
    {
      provide: InjectionTokens.IoServer,
      useValue: ioServer,
    },
    {
      provide: InjectionTokens.CasClient,
      useValue: casClient,
    },
  ],
})
export class AppModule {}
