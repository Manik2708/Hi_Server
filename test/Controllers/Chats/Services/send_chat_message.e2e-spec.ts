import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { SendMessageToUserService } from '../../../../src/Services/send_message_to_user';
import { EventNames } from '../../../../src/Constants/event_names';
import { RedisNames } from '../../../../src/Constants/queues_redis';
import { CassandraDatabaseQueries } from '../../../../src/Database/Cassandra/queries';
import { initClientSocket } from '../../../Helpers/create_socket_client';
import { RedisClientType } from '../../../../src/Constants/constant_types';
import { INestApplication } from '@nestjs/common';
import { Socket } from 'socket.io-client';
import { getTestingGlobalServicesModule } from '../../../Helpers/global_test_services.module';
import { TestServiceContainers } from '../../../Helpers/test_service_containers';
import { getTestingApp } from '../../../Helpers/get_testing_app';
import { nanoid } from 'nanoid';
import { MessageType } from '../../../../src/Constants/messasge_type';
import { consumeMessageFromQueue } from '../../../Helpers/consume_message_from_queue';
import { types } from 'cassandra-driver';
import { ChatMessageForUserService } from '../../../../src/Controllers/Chats/Services/send_chat_message_service';
import { searchChatMessage } from '../../../Helpers/search_chat_message';
import { CreateQueue } from '../../../../src/Queues/base';

describe(`Send chat message tests`, () => {
  let redisClient: RedisClientType;
  let app: INestApplication;
  let chatMessageForUserService: ChatMessageForUserService;
  let socketId: string;
  let socket: Socket;
  let outputData: any;
  beforeAll(async () => {
    redisClient = await TestServiceContainers.getTestingRedisClient().connect();
    const moduleRef = await getTestingGlobalServicesModule();
    app = await getTestingApp(moduleRef);
    chatMessageForUserService = new ChatMessageForUserService(
      moduleRef.get<SendMessageToUserService>(SendMessageToUserService),
      moduleRef.get<CassandraDatabaseQueries>(CassandraDatabaseQueries),
      TestServiceContainers.getTestingRabbitClient(),
    );
    socket = await initClientSocket((socket) => {
      socketId = socket.id!;
      socket.on(EventNames.recieveChatMessage, (data) => {
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
    const recieverId = nanoid().toLowerCase();
    const chatId = types.TimeUuid.now();
    await redisClient.sAdd(RedisNames.OnlineUsers, recieverId);
    await redisClient.hSet(RedisNames.OnlineUserMap + recieverId, {
      socketId: socketId,
    });
    const sendingObject = {
      messageId: types.TimeUuid.now(),
      chatId: chatId,
      senderId: senderId,
      recieverId: recieverId,
      message: nanoid().toLowerCase(),
      sendingTime: new Date(),
      status: 'SENT',
    };
    await chatMessageForUserService.sendChatMessage(
      sendingObject.messageId,
      sendingObject.chatId,
      sendingObject.senderId,
      sendingObject.recieverId,
      sendingObject.message,
      sendingObject.sendingTime,
      sendingObject.status,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    const expectedOutput = {
      message_id: sendingObject.messageId.toString(),
      chat_id: chatId.toString(),
      sender_id: senderId,
      reciever_id: recieverId,
      message: sendingObject.message,
      sending_time: sendingObject.sendingTime.toISOString(),
      status: 'SENT',
      owner_id: recieverId,
    };
    expect(outputData).toStrictEqual(expectedOutput);
    const chatMesssageForSender = await searchChatMessage(
      senderId,
      chatId.toString(),
      sendingObject.sendingTime,
      sendingObject.messageId.toString(),
    );
    expect(chatMesssageForSender.rowLength).toBe(1);
    expect(
      chatMesssageForSender.rows[0].get('reciever_id').toString(),
    ).toStrictEqual(recieverId);
    expect(
      chatMesssageForSender.rows[0].get('message').toString(),
    ).toStrictEqual(sendingObject.message);
    const chatMesssageForReciever = await searchChatMessage(
      recieverId,
      chatId.toString(),
      sendingObject.sendingTime,
      sendingObject.messageId.toString(),
    );
    expect(chatMesssageForReciever.rowLength).toBe(1);
    expect(
      chatMesssageForReciever.rows[0].get('sender_id').toString(),
    ).toStrictEqual(senderId);
    expect(
      chatMesssageForReciever.rows[0].get('message').toString(),
    ).toStrictEqual(sendingObject.message);
  });
  it(`When user is offline`, async () => {
    const senderId = nanoid().toLowerCase();
    const recieverId = nanoid().toLowerCase();
    const chatId = types.TimeUuid.now();
    const sendingObject = {
      messageId: types.TimeUuid.now(),
      chatId: chatId,
      senderId: senderId,
      recieverId: recieverId,
      message: nanoid().toLowerCase(),
      sendingTime: new Date(),
      status: 'SENT',
    };
    await chatMessageForUserService.sendChatMessage(
      sendingObject.messageId,
      sendingObject.chatId,
      sendingObject.senderId,
      sendingObject.recieverId,
      sendingObject.message,
      sendingObject.sendingTime,
      sendingObject.status,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    const expectedOutput = {
      message_type: MessageType.SEND_CHAT_MESSAGE,
      message_id: sendingObject.messageId.toString(),
      chat_id: chatId.toString(),
      sender_id: senderId,
      reciever_id: recieverId,
      message: sendingObject.message,
      sending_time: sendingObject.sendingTime.toISOString(),
      status: 'SENT',
      owner_id: recieverId,
    };
    const message = await consumeMessageFromQueue(recieverId);
    expect(message).toStrictEqual(expectedOutput);
    const chatMesssageForSender = await searchChatMessage(
      senderId,
      chatId.toString(),
      sendingObject.sendingTime,
      sendingObject.messageId.toString(),
    );
    expect(chatMesssageForSender.rowLength).toBe(1);
    expect(
      chatMesssageForSender.rows[0].get('reciever_id').toString(),
    ).toStrictEqual(recieverId);
    expect(
      chatMesssageForSender.rows[0].get('message').toString(),
    ).toStrictEqual(sendingObject.message);
    const chatMesssageForReciever = await searchChatMessage(
      recieverId,
      chatId.toString(),
      sendingObject.sendingTime,
      sendingObject.messageId.toString(),
    );
    expect(chatMesssageForReciever.rowLength).toBe(1);
    expect(
      chatMesssageForReciever.rows[0].get('sender_id').toString(),
    ).toStrictEqual(senderId);
    expect(
      chatMesssageForReciever.rows[0].get('message').toString(),
    ).toStrictEqual(sendingObject.message);
  });
});
