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
import {
  createTestConfession,
  createTestReadConfession,
} from '../../../Helpers/create_test_confession';
import {
  getSearchedConfession,
  getSearchedReadConfession,
} from '../../../Helpers/search_confession';
import { MessageType } from '../../../../src/Constants/messasge_type';
describe('Accept confession tests', () => {
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
  it('When user is online', async () => {
    const senderId = nanoid().toLowerCase();
    const crushId = nanoid().toLowerCase();
    const sendingObject: ConfessionModel = await createTestReadConfession(
      senderId,
      crushId,
    );
    await redisClient.sAdd(RedisNames.OnlineUsers, sendingObject.crush_id);
    await redisClient.hSet(RedisNames.OnlineUserMap + sendingObject.crush_id, {
      socketId: socketId,
    });
    const updateTme = new Date();
    const chatModel = await confessionServices.acceptConfession(
      sendingObject.confession_id,
      sendingObject.sending_time,
      sendingObject.crush_id,
      updateTme,
      sendingObject.reading_time!,
      sendingObject.confession_id,
      sendingObject.crush_name,
      sendingObject.sender_anonymous_id,
    );
    const expectedOutput = {
      chatModel: chatModel,
      updatedStatus: 'ACCEPTED',
      updateTime: updateTme.toISOString(),
    };
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(outputData).toStrictEqual(expectedOutput);
    const output = await getSearchedConfession(
      sendingObject.confession_id,
      sendingObject.sender_id,
      sendingObject.sending_time,
      CassandraTableNames.sentConfessions,
    );
    expect(output.rows[0].get('status')).toBe('ACCEPTED');
    expect(output.rows[0].get(`reaction_time`)).toStrictEqual(updateTme);
    const recieverReadOutput = await getSearchedReadConfession(
      sendingObject.confession_id,
      sendingObject.crush_id,
      updateTme,
    );
    expect(recieverReadOutput.rowLength).toBe(1);
    expect(recieverReadOutput.rows[0].get('status')).toBe(`ACCEPTED`);
    expect(recieverReadOutput.rows[0].get(`reaction_time`)).toStrictEqual(
      updateTme,
    );
  });
  it('When user is offline', async () => {
    const senderId = nanoid().toLowerCase();
    const crushId = nanoid().toLowerCase();
    const sendingObject: ConfessionModel = await createTestConfession(
      senderId,
      crushId,
    );
    const updateTme = new Date();
    await confessionServices.readConfession(
      sendingObject.confession_id,
      sendingObject.sender_id,
      sendingObject.sender_anonymous_id,
      sendingObject.crush_id,
      sendingObject.confession,
      sendingObject.sending_time,
      sendingObject.crush_name,
      updateTme,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    TestServiceContainers.getTestingRabbitClient().createChannel((chnl) => {
      chnl.assertQueue(QueueNames.OfflineQueue + sendingObject.crush_id, {
        durable: true,
      });
      chnl.consume(QueueNames.OfflineQueue + sendingObject.crush_id, (msg) => {
        if (msg == null) {
          outputData = null;
        } else {
          outputData = msg.content;
        }
      });
    });
    await new Promise((resolve) => setTimeout(resolve, 500));
    const expectedOutput = {
      messageType: MessageType.UPDATE_CONFESSION_STATUS,
      confessionId: sendingObject.confession_id,
      updatedStatus: 'READ',
      updateTime: updateTme.toISOString(),
    };
    expect(JSON.parse(outputData.toString())).toStrictEqual(expectedOutput);
    const output = await getSearchedConfession(
      sendingObject.confession_id,
      sendingObject.sender_id,
      sendingObject.sending_time,
      CassandraTableNames.sentConfessions,
    );
    expect(output.rows[0].get('status')).toBe('READ');
    expect(output.rows[0].get(`reading_time`)).toStrictEqual(updateTme);
    const recieverOutput = await getSearchedConfession(
      sendingObject.confession_id,
      sendingObject.sender_id,
      sendingObject.sending_time,
      CassandraTableNames.recievedUnreadConfessions,
    );
    expect(recieverOutput.rowLength).toBe(0);
    const recieverReadOutput = await getSearchedReadConfession(
      sendingObject.confession_id,
      sendingObject.crush_id,
      updateTme,
    );
    expect(recieverReadOutput.rowLength).toBe(1);
    expect(recieverReadOutput.rows[0].get('status')).toBe(`READ`);
    expect(recieverReadOutput.rows[0].get(`reading_time`)).toStrictEqual(
      updateTme,
    );
    expect(recieverReadOutput.rows[0].get(`reaction_time`)).toBe(null);
  });
});
