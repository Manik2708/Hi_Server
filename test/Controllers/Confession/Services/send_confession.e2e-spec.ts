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
import { MessageType } from '../../../../src/Constants/messasge_type';
import { CassandraTableNames } from '../../../../src/Constants/cassandra_constants';
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
      socket.on(EventNames.recieveConfession, (data) => {
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
    const mockedValue = types.TimeUuid.now();
    jest.spyOn(types.TimeUuid, 'now').mockImplementationOnce(() => {
      return mockedValue;
    });
    const sendingObject: ConfessionModel = {
      senderId: nanoid().toLowerCase(),
      senderAnonymousId: nanoid().toLowerCase(),
      confessionId: '',
      crushId: nanoid().toLowerCase(),
      confession: nanoid().toLowerCase(),
      sendingTime: new Date(),
      status: nanoid().toLowerCase(),
      crushName: nanoid().toLowerCase(),
    };
    await redisClient.sAdd(RedisNames.OnlineUsers, sendingObject.crushId);
    await redisClient.hSet(RedisNames.OnlineUserMap + sendingObject.crushId, {
      socketId: socketId,
    });
    await confessionServices.sendConfessionToUser(
      sendingObject.senderId,
      sendingObject.senderAnonymousId,
      sendingObject.crushId,
      sendingObject.confession,
      sendingObject.sendingTime,
      sendingObject.crushName,
    );
    const expectedValue = {
      senderId: sendingObject.senderId,
      senderAnonymousId: sendingObject.senderAnonymousId,
      crushId: sendingObject.crushId,
      confession: sendingObject.confession,
      sendingTime: sendingObject.sendingTime.toISOString(),
      confessionId: mockedValue.toString(),
      status: 'Sent',
      crushName: sendingObject.crushName,
    };
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(outputData).toStrictEqual(expectedValue);
    const output = await cassandraClient.execute(
      `SELECT * FROM hi_database.${CassandraTableNames.sentConfessions} 
    WHERE sender_id = ? AND
    sending_time = ? AND
    confession_id = ?
    `,
      [
        sendingObject.senderId,
        sendingObject.sendingTime.toString(),
        mockedValue.toString(),
      ],
      { prepare: true },
    );
    expect(output.rowLength).toBe(1);
    expect(output.rows[0].values().includes(sendingObject.confession)).toBe(
      true,
    );
    expect(
      output.rows[0]
        .values()
        .includes(
          sendingObject.sendingTime.toDateString() +
            ' ' +
            sendingObject.sendingTime.toTimeString(),
        ),
    ).toBe(true);
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
        sendingObject.sendingTime.toString(),
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
      recieverOutput.rows[0]
        .values()
        .includes(
          sendingObject.sendingTime.toDateString() +
            ' ' +
            sendingObject.sendingTime.toTimeString(),
        ),
    ).toBe(true);
    expect(
      recieverOutput.rows[0].values().includes(sendingObject.senderAnonymousId),
    ).toBe(true);
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
      sendingTime: new Date(),
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
    const expectedValue = {
      senderId: sendingObject.senderId,
      senderAnonymousId: sendingObject.senderAnonymousId,
      crushId: sendingObject.crushId,
      confession: sendingObject.confession,
      sendingTime: sendingObject.sendingTime.toISOString(),
      confessionId: mockedValue.toString(),
      status: 'Sent',
      crushName: sendingObject.crushName,
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
        sendingObject.sendingTime.toString(),
        mockedValue.toString(),
      ],
      { prepare: true },
    );
    expect(output.rowLength).toBe(1);
    expect(output.rows[0].values().includes(sendingObject.confession)).toBe(
      true,
    );
    expect(
      output.rows[0]
        .values()
        .includes(
          sendingObject.sendingTime.toDateString() +
            ' ' +
            sendingObject.sendingTime.toTimeString(),
        ),
    ).toBe(true);
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
        sendingObject.sendingTime.toString(),
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
      recieverOutput.rows[0]
        .values()
        .includes(
          sendingObject.sendingTime.toDateString() +
            ' ' +
            sendingObject.sendingTime.toTimeString(),
        ),
    ).toBe(true);
    expect(
      recieverOutput.rows[0].values().includes(sendingObject.senderAnonymousId),
    ).toBe(true);
  });
});
