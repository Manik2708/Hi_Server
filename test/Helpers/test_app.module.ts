import { Module } from "@nestjs/common";
import { InjectionTokens } from "../../src/Constants/injection_tokens";
import { CassandraDatabaseQueries } from "../../src/Database/Cassandra/queries";
import { SendMessageToUserService } from "../../src/Services/send_message_to_user";
import { WebSocketServices } from "../../src/Services/websocket_services";
import { WebSocketsGateWay } from "../../src/websockets.gateway";
import { TestServiceContainers } from "./test_service_containers";

@Module({
    providers: [
      SendMessageToUserService,
      CassandraDatabaseQueries,
      WebSocketServices,
      WebSocketsGateWay,
      {
        provide: InjectionTokens.RedisClient,
        useFactory: async () => {
          const client= TestServiceContainers.getTestingRedisClient();
          await client.connect();
          return client;
        },
      },
      {
        provide: InjectionTokens.CreateQueue,
        useValue: TestServiceContainers.getTestingRabbitClient,
      },
      {
        provide: InjectionTokens.CasClient,
        useValue: TestServiceContainers.getTestingCassandraClient,
      },
    ],
  })
export class TestAppModule{}