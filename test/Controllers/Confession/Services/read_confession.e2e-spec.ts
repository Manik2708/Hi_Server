import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { SendMessageToUserService } from '../../../../src/Services/send_message_to_user';
import { EventNames } from '../../../../src/Constants/event_names';
import { RedisNames } from '../../../../src/Constants/queues_redis';
import { ConfessionServices } from '../../../../src/Controllers/Confessions/Services/confession_services';
import { CassandraDatabaseQueries } from '../../../../src/Database/Cassandra/queries';
import { initClientSocket } from '../../../Helpers/create_socket_client';
import { RedisClientType } from '../../../../src/Constants/constant_types';
import { INestApplication } from '@nestjs/common';
import { Socket } from 'socket.io-client';
import { getTestingGlobalServicesModule } from '../../../Helpers/global_test_services.module';
import { TestServiceContainers } from '../../../Helpers/test_service_containers';
import { getTestingApp } from '../../../Helpers/get_testing_app';
import { Client } from 'cassandra-driver';
import { ConfessionModel } from '../../../../src/Models/confession';
import { nanoid } from 'nanoid';
import { CassandraTableNames } from '../../../../src/Constants/cassandra_constants';
import { createTestConfession } from '../../../Helpers/create_test_confession';
import { UpdateConfessionStatusForSender } from '../../../../src/Models/update_status_of_confession';
import {
  getSearchedConfession,
  getSearchedReadConfession,
} from '../../../Helpers/search_confession';
describe('Send confession tests', () => {
  let redisClient: RedisClientType;
  let app: INestApplication;
  let confessionServices: ConfessionServices;
  let socketId: string;
  let socket: Socket;
  let outputData: any;
  let cassandraClient: Client;
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
    cassandraClient = TestServiceContainers.getTestingCassandraClient();
  });
  afterAll(async () => {
    await app.close();
    socket.disconnect();
  });
  it('When user is online', async () => {
    const senderId = nanoid().toLowerCase();
    const crushId = nanoid().toLowerCase();
    const sendingObject: ConfessionModel = await createTestConfession(
      senderId,
      crushId,
    );
    await redisClient.sAdd(RedisNames.OnlineUsers, sendingObject.crushId);
    await redisClient.hSet(RedisNames.OnlineUserMap + sendingObject.crushId, {
      socketId: socketId,
    });
    const updateTme = new Date();
    await confessionServices.readConfession(
      sendingObject.confessionId,
      sendingObject.senderId,
      sendingObject.senderAnonymousId,
      sendingObject.crushId,
      sendingObject.confession,
      sendingObject.sendingTime,
      sendingObject.crushName,
      updateTme,
    );
    const expectedOutput: UpdateConfessionStatusForSender = {
      confessionId: sendingObject.confessionId,
      updatedStatus: 'Read',
      updateTime: updateTme,
    };
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(outputData).toStrictEqual(expectedOutput);
    const output = await getSearchedConfession(
      sendingObject.confessionId,
      sendingObject.senderId,
      sendingObject.sendingTime,
      CassandraTableNames.sentConfessions,
    );
    expect(output.rows[0].values().includes('Read')).toBe(true);
    const recieverOutput = await getSearchedConfession(
      sendingObject.confessionId,
      sendingObject.senderId,
      sendingObject.sendingTime,
      CassandraTableNames.recievedUnreadConfessions,
    );
    expect(recieverOutput.rowLength).toBe(0);
    const recueverReadOutput = await getSearchedReadConfession(
      sendingObject.confessionId,
      sendingObject.senderId,
      sendingObject.sendingTime,
      CassandraTableNames.recievedReadConfessions,
    );
    expect(recueverReadOutput.rowLength).toBe(1);
  });
});
