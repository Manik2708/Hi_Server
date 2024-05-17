import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
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
import { ConfessionModel } from '../../../../src/Models/confession';
import { nanoid } from 'nanoid';
import { CassandraTableNames } from '../../../../src/Constants/cassandra_constants';
import { createTestReadConfession } from '../../../Helpers/create_test_confession';
import {
  getSearchedConfession,
  getSearchedReadConfession,
} from '../../../Helpers/search_confession';
import { MessageType } from '../../../../src/Constants/messasge_type';
import { consumeMessageFromQueue } from '../../../Helpers/consume_message_from_queue';
import { types } from 'cassandra-driver';
import {
  searchChatAmongCrush,
  searchChatAmongSender,
} from '../../../Helpers/search_chat';

describe(`Accept confession tests`, () => {
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
      socket.on(EventNames.acceptConfession, (data) => {
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
    await redisClient.sAdd(RedisNames.OnlineUsers, sendingObject.sender_id);
    await redisClient.hSet(RedisNames.OnlineUserMap + sendingObject.sender_id, {
      socketId: socketId,
    });
    const updateTme = new Date();
    const chatId = types.TimeUuid.now();
    jest.spyOn(types.TimeUuid, 'now').mockImplementationOnce(() => {
      return chatId;
    });

    const chat = await confessionServices.acceptConfession(
      sendingObject.sender_id,
      sendingObject.sending_time,
      sendingObject.crush_id,
      updateTme,
      sendingObject.reading_time!,
      sendingObject.confession_id,
      sendingObject.crush_name,
      sendingObject.sender_anonymous_id,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { last_update, chat_id, ...chat_model } = chat;
    const updated_chat = {
      last_update: last_update.toISOString(),
      chat_id: chat_id.toString(),
      ...chat_model,
    };
    const expectedOutput = {
      chat_model: updated_chat,
      updated_status: 'ACCEPTED',
      update_time: updateTme.toISOString(),
    };
    expect(outputData).toStrictEqual(expectedOutput);
    const searchResult = await getSearchedReadConfession(
      sendingObject.confession_id,
      sendingObject.crush_id,
      sendingObject.reading_time!,
    );
    const row = searchResult.rows[0];
    expect(row.get('status')).toBe('ACCEPTED');
    const searchSendResult = await getSearchedConfession(
      sendingObject.confession_id,
      sendingObject.sender_id,
      sendingObject.sending_time,
      CassandraTableNames.sentConfessions,
    );
    expect(searchSendResult.rows[0].get('status')).toBe('ACCEPTED');
    const chatForSenderResult = await searchChatAmongSender(
      chat.user_id,
      chat.last_update,
      chat.chat_id.toString(),
    );
    expect(chatForSenderResult.rowLength).toBe(1);
    expect(chatForSenderResult.rows[0].get('chat_id').toString()).toBe(
      chatId.toString(),
    );
    const chatForCrushResult = await searchChatAmongCrush(
      chat.crush_id,
      chat.last_update,
      chat.chat_id.toString(),
    );
    expect(chatForCrushResult.rowLength).toBe(1);
    expect(chatForCrushResult.rows[0].get('chat_id').toString()).toBe(
      chatId.toString(),
    );
  });
  it(`When user is offline`, async () => {
    const senderId = nanoid().toLowerCase();
    const crushId = nanoid().toLowerCase();
    const sendingObject: ConfessionModel = await createTestReadConfession(
      senderId,
      crushId,
    );
    const updateTme = new Date();
    const chatId = types.TimeUuid.now();
    jest.spyOn(types.TimeUuid, 'now').mockImplementationOnce(() => {
      return chatId;
    });
    const chat = await confessionServices.acceptConfession(
      sendingObject.sender_id,
      sendingObject.sending_time,
      sendingObject.crush_id,
      updateTme,
      sendingObject.reading_time!,
      sendingObject.confession_id,
      sendingObject.crush_name,
      sendingObject.sender_anonymous_id,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    const message = await consumeMessageFromQueue(sendingObject.sender_id);
    const { last_update, chat_id, ...chat_model } = chat;
    const updated_chat = {
      last_update: last_update.toISOString(),
      chat_id: chat_id.toString(),
      ...chat_model,
    };
    const expectedOutput = {
      message_type: MessageType.ACCEPT_CONFESSION_TYPE,
      chat_model: updated_chat,
      updated_status: 'ACCEPTED',
      update_time: updateTme.toISOString(),
    };
    expect(message).toStrictEqual(expectedOutput);
    const searchResult = await getSearchedReadConfession(
      sendingObject.confession_id,
      sendingObject.crush_id,
      sendingObject.reading_time!,
    );
    const row = searchResult.rows[0];
    expect(row.get('status')).toBe('ACCEPTED');
    const searchSendResult = await getSearchedConfession(
      sendingObject.confession_id,
      sendingObject.sender_id,
      sendingObject.sending_time,
      CassandraTableNames.sentConfessions,
    );
    expect(searchSendResult.rows[0].get('status')).toBe('ACCEPTED');
    const chatForSenderResult = await searchChatAmongSender(
      chat.user_id,
      chat.last_update,
      chat.chat_id.toString(),
    );
    expect(chatForSenderResult.rowLength).toBe(1);
    expect(chatForSenderResult.rows[0].get('chat_id').toString()).toBe(
      chatId.toString(),
    );
    const chatForCrushResult = await searchChatAmongCrush(
      chat.crush_id,
      chat.last_update,
      chat.chat_id.toString(),
    );
    expect(chatForCrushResult.rowLength).toBe(1);
    expect(chatForCrushResult.rows[0].get('chat_id').toString()).toBe(
      chatId.toString(),
    );
  });
});
