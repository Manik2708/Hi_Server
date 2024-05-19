import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import { ControllerPaths } from '../../../src/Constants/contoller_paths';
import { RetrieveDataRoutes } from '../../../src/Constants/route_paths';
import { createChatWithTenMessages } from '../../Helpers/create_chat';
import { getTestingGlobalServicesModule } from '../../Helpers/global_test_services.module';
import request from 'supertest';
import { createTestUser } from '../../Helpers/create_test_user';
import { getResolvedTestModule } from '../../Helpers/setup_middleware_env';
import mongoose from 'mongoose';
import { createMongoInstance } from '../../Helpers/db_instance';
import { Test } from '@nestjs/testing';
import { WebSocketServices } from '../../../src/Services/websocket_services';
import { RetrieveDataServices } from '../../../src/Controllers/RetrieveData/Services/retrieve_data_services';
import { InjectionTokens } from '../../../src/Constants/injection_tokens';
import { TestServiceContainers } from '../../Helpers/test_service_containers';
import { RetrieveDataController } from '../../../src/Controllers/RetrieveData/retrieve_data';
import { CassandraDatabaseQueries } from '../../../src/Database/Cassandra/queries';
import { TestMiddlewareModule } from '../../Helpers/test_middleware.module';
describe(`Retrieve data after login tests`, () => {
  let app: INestApplication;
  const routeName =
    '/' +
    ControllerPaths.RETRIEVE_DATA_CONTROLLER +
    '/' +
    RetrieveDataRoutes.RETRIEVE_DATA_AFTER_LOGIN;
  let mongooseInstance: typeof mongoose;
  beforeAll(async () => {
    mongooseInstance = await createMongoInstance();
    const moduleRef = await getTestingGlobalServicesModule();
    const test = await Test.createTestingModule({
      providers: [
        WebSocketServices,
        RetrieveDataServices,
        CassandraDatabaseQueries,
        {
          provide: InjectionTokens.CasClient,
          useValue: TestServiceContainers.getTestingCassandraClient(),
        },
        {
          provide: InjectionTokens.RedisClient,
          useValue: TestServiceContainers.getTestingRedisClient(),
        },
        {
          provide: InjectionTokens.CreateQueue,
          useValue: TestServiceContainers.getTestingRabbitClient(),
        },
      ],
      controllers: [RetrieveDataController],
      imports: [TestMiddlewareModule],
    }).compile();
    app = test.createNestApplication();
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });
  it('Test, whether data is able to get retrieved', async () => {
    const user = await createTestUser();
    const user_id = user._id._id.toString();
    await createChatWithTenMessages(user_id, false);
    await createChatWithTenMessages(user_id, true);
    getResolvedTestModule(user);
    const response = await request(app.getHttpServer()).get(routeName);
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(response.text);
  });
});
