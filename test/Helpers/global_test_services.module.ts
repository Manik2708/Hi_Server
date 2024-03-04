import { Test, TestingModule } from '@nestjs/testing';
import { TestServiceContainers } from './test_service_containers';
import { WebSocketsGateWay } from '../../src/websockets.gateway';
import { WebSocketServices } from '../../src/Services/websocket_services';
import { UserOnlineServices } from '../../src/Services/user_online_services';
import { InjectionTokens } from '../../src/Constants/injection_tokens';
import { CassandraDatabaseQueries } from '../../src/Database/Cassandra/queries';
import { SendMessageToUserService } from '../../src/Services/send_message_to_user';

export const getTestingGlobalServicesModule =
  async (): Promise<TestingModule> => {
    const redisClient =
      await TestServiceContainers.getTestingRedisClient().connect();
    const rabbitClient = TestServiceContainers.getTestingRabbitClient();
    const cassandraClient = TestServiceContainers.getTestingCassandraClient();
    const moduleRef = await Test.createTestingModule({
      providers: [
        WebSocketsGateWay,
        WebSocketServices,
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
    }).compile();
    return moduleRef;
  };
