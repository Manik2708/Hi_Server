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
      sender_id: nanoid().toLowerCase(),
      sender_anonymous_id: nanoid().toLowerCase(),
      confession_id: '',
      crush_id: nanoid().toLowerCase(),
      confession: nanoid().toLowerCase(),
      sending_time: new Date(),
      status: nanoid().toLowerCase(),
      crush_name: nanoid().toLowerCase(),
    };
    await redisClient.sAdd(RedisNames.OnlineUsers, sendingObject.crush_id);
    await redisClient.hSet(RedisNames.OnlineUserMap + sendingObject.crush_id, {
      socketId: socketId,
    });
    await confessionServices.sendConfessionToUser(
      sendingObject.sender_id,
      sendingObject.sender_anonymous_id,
      sendingObject.crush_id,
      sendingObject.confession,
      sendingObject.sending_time,
      sendingObject.crush_name,
    );
    const expectedValue = {
      senderId: sendingObject.sender_id,
      senderAnonymousId: sendingObject.sender_anonymous_id,
      crushId: sendingObject.crush_id,
      confession: sendingObject.confession,
      sendingTime: sendingObject.sending_time.toISOString(),
      confessionId: mockedValue.toString(),
      status: 'Sent',
      crushName: sendingObject.crush_name,
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
        sendingObject.sender_id,
        sendingObject.sending_time.toString(),
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
          sendingObject.sending_time.toDateString() +
            ' ' +
            sendingObject.sending_time.toTimeString(),
        ),
    ).toBe(true);
    expect(
      output.rows[0].values().includes(sendingObject.sender_anonymous_id),
    ).toBe(false);
    const recieverOutput = await cassandraClient.execute(
      `SELECT * FROM hi_database.${CassandraTableNames.recievedUnreadConfessions}
    WHERE crush_id = ? AND
    sending_time = ? AND
    confession_id = ?
    `,
      [
        sendingObject.crush_id,
        sendingObject.sending_time.toString(),
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
          sendingObject.sending_time.toDateString() +
            ' ' +
            sendingObject.sending_time.toTimeString(),
        ),
    ).toBe(true);
    expect(
      recieverOutput.rows[0]
        .values()
        .includes(sendingObject.sender_anonymous_id),
    ).toBe(true);
  });
  it('When user is offline', async () => {
    const mockedValue = types.TimeUuid.now();
    jest.spyOn(types.TimeUuid, 'now').mockImplementationOnce(() => {
      return mockedValue;
    });
    let outputData: any;
    const sendingObject: ConfessionModel = {
      sender_id: nanoid().toLowerCase(),
      sender_anonymous_id: nanoid().toLowerCase(),
      confession_id: '',
      crush_id: nanoid().toLowerCase(),
      confession: nanoid().toLowerCase(),
      sending_time: new Date(),
      status: nanoid().toLowerCase(),
      crush_name: nanoid().toLowerCase(),
    };
    await confessionServices.sendConfessionToUser(
      sendingObject.sender_id,
      sendingObject.sender_anonymous_id,
      sendingObject.crush_id,
      sendingObject.confession,
      sendingObject.sending_time,
      sendingObject.crush_name,
    );
    const expectedValue = {
      senderId: sendingObject.sender_id,
      senderAnonymousId: sendingObject.sender_anonymous_id,
      crushId: sendingObject.crush_id,
      confession: sendingObject.confession,
      sendingTime: sendingObject.sending_time.toISOString(),
      confessionId: mockedValue.toString(),
      status: 'Sent',
      crushName: sendingObject.crush_name,
      messageType: MessageType.CONFESSION_MESSAGE_TYPE,
    };
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
    expect(JSON.parse(outputData.toString())).toStrictEqual(expectedValue);
    const output = await cassandraClient.execute(
      `SELECT * FROM hi_database.${CassandraTableNames.sentConfessions} 
    WHERE sender_id = ? AND
    sending_time = ? AND
    confession_id = ?
    `,
      [
        sendingObject.sender_id,
        sendingObject.sending_time.toString(),
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
          sendingObject.sending_time.toDateString() +
            ' ' +
            sendingObject.sending_time.toTimeString(),
        ),
    ).toBe(true);
    expect(
      output.rows[0].values().includes(sendingObject.sender_anonymous_id),
    ).toBe(false);
    const recieverOutput = await cassandraClient.execute(
      `SELECT * FROM hi_database.${CassandraTableNames.recievedUnreadConfessions}
    WHERE crush_id = ? AND
    sending_time = ? AND
    confession_id = ?
    `,
      [
        sendingObject.crush_id,
        sendingObject.sending_time.toString(),
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
          sendingObject.sending_time.toDateString() +
            ' ' +
            sendingObject.sending_time.toTimeString(),
        ),
    ).toBe(true);
    expect(
      recieverOutput.rows[0]
        .values()
        .includes(sendingObject.sender_anonymous_id),
    ).toBe(true);
  });
});
