import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { SendMessageToUserService } from '../../../../src/Services/send_message_to_user';
import { EventNames } from '../../../../src/Constants/event_names';
import { QueueNames, RedisNames } from '../../../../src/Constants/queues_redis';
import { ConfessionServices } from '../../../../src/Controllers/Confessions/Services/confession_services';
import { CassandraDatabaseQueries } from '../../../../src/Database/Cassandra/queries';
import { initClientSocket } from '../../../Helpers/create_socket_client';
import { RedisClientType } from '../../../../src/Constants/constant_types';
import { INestApplication } from '@nestjs/common';
import { Socket } from 'socket.io-client';
import { getTestingGlobalServicesModule } from '../../../Helpers/global_test_services.module';
import { TestServiceContainers } from '../../../Helpers/test_service_containers';
import { getTestingApp } from '../../../Helpers/get_testing_app';
import { ConfessionModel } from '../../../../src/Models/confession';
import { nanoid } from 'nanoid';
import { CassandraTableNames } from '../../../../src/Constants/cassandra_constants';
import { createTestReadConfession } from '../../../Helpers/create_test_confession';
import {
  getSearchedConfession,
  getSearchedReadConfession,
} from '../../../Helpers/search_confession';
import { MessageType } from '../../../../src/Constants/messasge_type';

describe(`Reject confession tests`, () => {
  let redisClient: RedisClientType;
  let app: INestApplication;
  let confessionServices: ConfessionServices;
  let socketId: string;
  let socket: Socket;
  let outputData: any;
  beforeAll(async () => {
    redisClient = await TestServiceContainers.getTestingRedisClient().connect();
    const moduleRef = await getTestingGlobalServicesModule();
    app = await getTestingApp(moduleRef);
    confessionServices = new ConfessionServices(
      moduleRef.get<SendMessageToUserService>(SendMessageToUserService),
      moduleRef.get<CassandraDatabaseQueries>(CassandraDatabaseQueries),
    );
    socket = await initClientSocket((socket) => {
      socketId = socket.id!;
      socket.on(EventNames.updateConfssionStatus, (data) => {
        outputData = data;
      });
    });
  });
  afterAll(async () => {
    await app.close();
    socket.disconnect();
  });
  it(`When user is online`, async () => {
    const senderId = nanoid().toLowerCase();
    const crushId = nanoid().toLowerCase();
    const sendingObject: ConfessionModel = await createTestReadConfession(
      senderId,
      crushId,
    );
    await redisClient.sAdd(RedisNames.OnlineUsers, sendingObject.senderId);
    await redisClient.hSet(RedisNames.OnlineUserMap + sendingObject.senderId, {
      socketId: socketId,
    });
    const updateTme = new Date();
    await confessionServices.rejectConfession(
      sendingObject.senderId,
      sendingObject.sendingTime,
      sendingObject.crushId,
      updateTme,
      sendingObject.readingTime!,
      sendingObject.confessionId,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    const expectedOutput = {
      confessionId: sendingObject.confessionId,
      updatedStatus: 'REJECTED',
      updateTime: updateTme.toISOString(),
    };
    expect(outputData).toStrictEqual(expectedOutput);
  });
});
