import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
} from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import { ControllerPaths } from '../../../src/Constants/contoller_paths';
import { RetrieveDataRoutes } from '../../../src/Constants/route_paths';
import { createChat } from '../../Helpers/create_chat';
import request from 'supertest';
import { createTestUser } from '../../Helpers/create_test_user';
import { getResolvedTestModule } from '../../Helpers/setup_middleware_env';
import mongoose from 'mongoose';
import { createMongoInstance } from '../../Helpers/db_instance';
import { Test } from '@nestjs/testing';
import { RetrieveDataServices } from '../../../src/Controllers/RetrieveData/Services/retrieve_data_services';
import { InjectionTokens } from '../../../src/Constants/injection_tokens';
import { TestServiceContainers } from '../../Helpers/test_service_containers';
import { RetrieveDataController } from '../../../src/Controllers/RetrieveData/retrieve_data';
import { CassandraDatabaseQueries } from '../../../src/Database/Cassandra/queries';
import { TestMiddlewareModule } from '../../Helpers/test_middleware.module';
import { delay } from '../../Helpers/get_testing_app';
import { GRPCClientAddress } from '../../../src/service_containers';

describe(`Retrieve data after login tests`, () => {
  let app: INestApplication;
  const routeName =
    '/' +
    ControllerPaths.RETRIEVE_DATA_CONTROLLER +
    '/' +
    RetrieveDataRoutes.RETRIEVE_CHATS_FOR_SENDER;
  let mongooseInstance: typeof mongoose;
  beforeAll(async () => {
    mongooseInstance = await createMongoInstance();
    const test = await Test.createTestingModule({
      providers: [
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
        {
          provide: InjectionTokens.GRPClientAddress,
          useValue: GRPCClientAddress,
        },
      ],
      controllers: [RetrieveDataController],
      imports: [TestMiddlewareModule],
    }).compile();
    app = test.createNestApplication();
    await app.init();
  });
  afterAll(async () => {
    await TestServiceContainers.getTestingCassandraClient().shutdown();
    await app.close();
  });
  afterEach(async () => {
    await app.close();
    await delay();
  });
  it('Test for retrieving chats for sender', async () => {
    const user = await createTestUser();
    const user_id = user._id._id.toString();
    let expectation: string = '';
    for (let i = 0; i < 10; i++) {
      const chat = await createChat(user_id, false);
      const { anonymous_id, ...chat_left } = chat;
      expectation += JSON.stringify(chat_left);
    }
    getResolvedTestModule(user);
    const response = await request(app.getHttpServer()).get(routeName);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const res = response.text;
    expect(res).toBe(expectation);
  });
  it('Test for retrieving chats for crush', async () => {
    const newRouteName =
      '/' +
      ControllerPaths.RETRIEVE_DATA_CONTROLLER +
      '/' +
      RetrieveDataRoutes.RETRIEVE_CHATS_FOR_CRUSH;
    const user = await createTestUser();
    const user_id = user._id._id.toString();
    let expectation: string = '';
    for (let i = 0; i < 10; i++) {
      const object = await createChat(user_id, true);
      const { crush_name, ...chat } = object;
      const ordered_object: any = {
        chat_id: chat.chat_id,
        anonymous_id: chat.anonymous_id,
        crush_id: chat.crush_id,
        user_id: chat.user_id,
        last_update: chat.last_update,
        confession_id: chat.confession_id,
        messages: chat.messages,
      };
      expectation += JSON.stringify(ordered_object);
    }
    getResolvedTestModule(user);
    const response = await request(app.getHttpServer()).get(newRouteName);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(response.text).toBe(expectation);
  });
});
