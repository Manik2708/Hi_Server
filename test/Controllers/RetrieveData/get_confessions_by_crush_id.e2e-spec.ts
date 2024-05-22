import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  jest,
  afterEach,
} from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import { ControllerPaths } from '../../../src/Constants/contoller_paths';
import { RetrieveDataRoutes } from '../../../src/Constants/route_paths';
import { getTestingGlobalServicesModule } from '../../Helpers/global_test_services.module';
import request from 'supertest';
import { createTestUser } from '../../Helpers/create_test_user';
import mongoose from 'mongoose';
import { createMongoInstance } from '../../Helpers/db_instance';
import { Test } from '@nestjs/testing';
import { WebSocketServices } from '../../../src/Services/websocket_services';
import { RetrieveDataServices } from '../../../src/Controllers/RetrieveData/Services/retrieve_data_services';
import { InjectionTokens } from '../../../src/Constants/injection_tokens';
import { TestServiceContainers } from '../../Helpers/test_service_containers';
import { RetrieveDataController } from '../../../src/Controllers/RetrieveData/retrieve_data';
import { CassandraDatabaseQueries } from '../../../src/Database/Cassandra/queries';
import {
  createTestConfession,
  createTestReadConfession,
} from '../../Helpers/create_test_confession';
import { nanoid } from 'nanoid';
import express from 'express';
import { delay } from '../../Helpers/get_testing_app';
describe(`Retrieve data after login tests`, () => {
  let app: INestApplication;
  const routeName =
    '/' +
    ControllerPaths.RETRIEVE_DATA_CONTROLLER +
    '/' +
    RetrieveDataRoutes.GET_CONFESSIONS_BY_CRUSH_ID;
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
    }).compile();
    app = test.createNestApplication();
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });
  afterEach(async () => {
    await app.close();
    await delay();
  });
  it('Test for retreiving chats for sender', async () => {
    const user = await createTestUser();
    const user_id = user._id._id.toString();
    const crush_id = nanoid().toLowerCase();
    for (let i = 0; i < 60; i++) {
      await createTestConfession(user_id, crush_id);
    }
    jest.spyOn(express.request, 'header').mockImplementationOnce(() => {
      return crush_id;
    });
    const response1 = await request(app.getHttpServer()).get(routeName);
    const firstResponse = JSON.parse(response1.text);
    expect(firstResponse.page_state == null).toBe(false);
    expect(firstResponse.confessions.length).toBe(50);
    const response2 = await request(app.getHttpServer())
      .get(routeName)
      .set(`page_state`, firstResponse.page_state)
      .set(`crush_id`, crush_id);
    const secondResponse = JSON.parse(response2.text);
    expect(secondResponse.page_state == null).toBe(true);
    expect(secondResponse.confessions.length).toBe(10);
  }, 1000);
  it('Test for retreiving chats for sender', async () => {
    const routeName =
      '/' +
      ControllerPaths.RETRIEVE_DATA_CONTROLLER +
      '/' +
      RetrieveDataRoutes.GET_READ_CONFESSIONS_BY_CRUSH_ID;
    const user = await createTestUser();
    const user_id = user._id._id.toString();
    const crush_id = nanoid().toLowerCase();
    for (let i = 0; i < 60; i++) {
      await createTestReadConfession(user_id, crush_id);
    }
    jest.spyOn(express.request, 'header').mockImplementationOnce(() => {
      return crush_id;
    });
    const response1 = await request(app.getHttpServer()).get(routeName);
    const firstResponse = JSON.parse(response1.text);
    expect(firstResponse.page_state == null).toBe(false);
    expect(firstResponse.confessions.length).toBe(50);
    const response2 = await request(app.getHttpServer())
      .get(routeName)
      .set(`page_state`, firstResponse.page_state)
      .set(`crush_id`, crush_id);
    const secondResponse = JSON.parse(response2.text);
    expect(secondResponse.page_state == null).toBe(true);
    expect(secondResponse.confessions.length).toBe(10);
  }, 1000);
});
