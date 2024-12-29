import { Test, TestingModule } from '@nestjs/testing';
import { TestServiceContainers } from './test_service_containers';
import { UserOnlineServices } from '../../src/Services/user_online_services';
import { InjectionTokens } from '../../src/Constants/injection_tokens';
import { CassandraDatabaseQueries } from '../../src/Database/Cassandra/queries';
import { SendMessageToUserService } from '../../src/Services/send_message_to_user';
import { GRPCClientAddress } from '../../src/service_containers';

export const getTestingGlobalServicesModule =
  async (): Promise<TestingModule> => {
    const redisClient =
      await TestServiceContainers.getTestingRedisClient().connect();
    const rabbitClient = TestServiceContainers.getTestingRabbitClient();
    const cassandraClient = TestServiceContainers.getTestingCassandraClient();
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserOnlineServices,
        CassandraDatabaseQueries,
        SendMessageToUserService,
        {
          provide: InjectionTokens.CasClient,
          useValue: cassandraClient,
        },
        {
          provide: InjectionTokens.RedisClient,
          useValue: redisClient,
        },
        {
          provide: InjectionTokens.CreateQueue,
          useValue: rabbitClient,
        },
        {
          provide: InjectionTokens.GRPClientAddress,
          useValue: GRPCClientAddress,
        },
      ],
      exports: [
        InjectionTokens.RedisClient,
        InjectionTokens.CreateQueue,
        InjectionTokens.CasClient,
      ],
    }).compile();
    return moduleRef;
  };

export class TestServiceModule {
  static getTestingModule = async (): Promise<TestingModule> => {
    const redisClient =
      await TestServiceContainers.getTestingRedisClient().connect();
    const rabbitClient = TestServiceContainers.getTestingRabbitClient();
    const cassandraClient = TestServiceContainers.getTestingCassandraClient();
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserOnlineServices,
        CassandraDatabaseQueries,
        SendMessageToUserService,
        {
          provide: InjectionTokens.CasClient,
          useValue: cassandraClient,
        },
        {
          provide: InjectionTokens.RedisClient,
          useValue: redisClient,
        },
        {
          provide: InjectionTokens.CreateQueue,
          useValue: rabbitClient,
        },
      ],
      exports: [
        InjectionTokens.RedisClient,
        InjectionTokens.CreateQueue,
        InjectionTokens.CasClient,
      ],
    }).compile();
    return moduleRef;
  };
}
