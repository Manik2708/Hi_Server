import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
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
import { Client, types } from 'cassandra-driver';
import { ConfessionModel } from '../../../../src/Models/confession';
import { nanoid } from 'nanoid';
import { MessageHandler } from '../../../../src/Models/message_handler';
import { MessageType } from '../../../../src/Constants/messasge_type';
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
    const updateTme = Date.now().toString();
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
  it('When user is offline', async () => {
    const mockedValue = types.TimeUuid.now();
    jest.spyOn(types.TimeUuid, 'now').mockImplementationOnce(() => {
      return mockedValue;
    });
    let outputData: any;
    const sendingObject: ConfessionModel = {
      senderId: nanoid().toLowerCase(),
      senderAnonymousId: nanoid().toLowerCase(),
      confessionId: '',
      crushId: nanoid().toLowerCase(),
      confession: nanoid().toLowerCase(),
      sendingTime: Date.now().toString(),
      status: nanoid().toLowerCase(),
      crushName: nanoid().toLowerCase(),
    };
    await confessionServices.sendConfessionToUser(
      sendingObject.senderId,
      sendingObject.senderAnonymousId,
      sendingObject.crushId,
      sendingObject.confession,
      sendingObject.sendingTime,
      sendingObject.crushName,
    );
    const expectedValue: MessageHandler = {
      ...sendingObject,
      confessionId: mockedValue.toString(),
      status: 'Sent',
      messageType: MessageType.CONFESSION_MESSAGE_TYPE,
    };
    await new Promise((resolve) => setTimeout(resolve, 500));
    TestServiceContainers.getTestingRabbitClient().createChannel((chnl) => {
      chnl.assertQueue(QueueNames.OfflineQueue + sendingObject.crushId, {
        durable: true,
      });
      chnl.consume(QueueNames.OfflineQueue + sendingObject.crushId, (msg) => {
        if (msg == null) {
          outputData = null;
        } else {
          outputData = msg.content;
        }
      });
    });
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(JSON.parse(outputData.toString())).toStrictEqual(expectedValue);
    const output = await cassandraClient.execute(
      `SELECT * FROM hi_database.${CassandraTableNames.sentConfessions} 
    WHERE sender_id = ? AND
    sending_time = ? AND
    confession_id = ?
    `,
      [
        sendingObject.senderId,
        sendingObject.sendingTime,
        mockedValue.toString(),
      ],
      { prepare: true },
    );
    expect(output.rowLength).toBe(1);
    expect(output.rows[0].values().includes(sendingObject.confession)).toBe(
      true,
    );
    expect(output.rows[0].values().includes(sendingObject.sendingTime)).toBe(
      true,
    );
    expect(
      output.rows[0].values().includes(sendingObject.senderAnonymousId),
    ).toBe(false);
    const recieverOutput = await cassandraClient.execute(
      `SELECT * FROM hi_database.${CassandraTableNames.recievedUnreadConfessions}
    WHERE crush_id = ? AND
    sending_time = ? AND
    confession_id = ?
    `,
      [
        sendingObject.crushId,
        sendingObject.sendingTime,
        mockedValue.toString(),
      ],
      {
        prepare: true,
      },
    );
    expect(recieverOutput.rowLength).toBe(1);
    expect(
      recieverOutput.rows[0].values().includes(sendingObject.confession),
    ).toBe(true);
    expect(
      recieverOutput.rows[0].values().includes(sendingObject.sendingTime),
    ).toBe(true);
    expect(
      recieverOutput.rows[0].values().includes(sendingObject.senderAnonymousId),
    ).toBe(true);
  });
});
