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
import { DeleteMessageModel } from '../../../../src/Models/update_status_of_chat_message';
import { createSingleChatMessage } from '../../../Helpers/create_chat_message';

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
      socket.on(EventNames.deleteChatMessage, (data) => {
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
    await redisClient.sAdd(RedisNames.OnlineUsers, recieverId);
    await redisClient.hSet(RedisNames.OnlineUserMap + recieverId, {
      socketId: socketId,
    });
    const chat_id = types.TimeUuid.now();
    const chatMessage = await createSingleChatMessage('DELIEVERED', chat_id);
    const sendingObject: DeleteMessageModel = {
      requester_id: senderId,
      chat_id: chatMessage.chat_id.toString(),
      reciever_id: recieverId,
      message_id: chatMessage.message_id.toString(),
      sending_time: chatMessage.sending_time,
    };
    await chatMessageForUserService.deleteChatMessageForEveryOne(sendingObject);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const expectedOutput = {
      requester_id: senderId,
      chat_id: chatMessage.chat_id.toString(),
      reciever_id: recieverId,
      message_id: chatMessage.message_id.toString(),
      sending_time: chatMessage.sending_time.toISOString(),
    };
    expect(outputData).toStrictEqual(expectedOutput);
    const chatMesssageForSender = await searchChatMessage(
      senderId,
      chat_id.toString(),
      sendingObject.sending_time,
      sendingObject.message_id.toString(),
    );
    expect(chatMesssageForSender.rowLength).toBe(0);
    const chatMesssageForReciever = await searchChatMessage(
      recieverId,
      chat_id.toString(),
      sendingObject.sending_time,
      sendingObject.message_id.toString(),
    );
    expect(chatMesssageForReciever.rowLength).toBe(0);
  });
  it(`When user is offline`, async () => {
    const senderId = nanoid().toLowerCase();
    const recieverId = nanoid().toLowerCase();
    const chat_id = types.TimeUuid.now();
    const chatMessage = await createSingleChatMessage('DELIEVERED', chat_id);
    const sendingObject: DeleteMessageModel = {
      requester_id: senderId,
      chat_id: chatMessage.chat_id.toString(),
      reciever_id: recieverId,
      message_id: chatMessage.message_id.toString(),
      sending_time: chatMessage.sending_time,
    };
    await chatMessageForUserService.deleteChatMessageForEveryOne(sendingObject);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const message = await consumeMessageFromQueue(recieverId);
    const expectedOutput = {
      requester_id: senderId,
      chat_id: chatMessage.chat_id.toString(),
      reciever_id: recieverId,
      message_id: chatMessage.message_id.toString(),
      sending_time: chatMessage.sending_time.toISOString(),
    };
    expect(message).toStrictEqual({
      message_type: MessageType.DELETE_CHAT_MESSASGE,
      ...expectedOutput,
    });
    const chatMesssageForSender = await searchChatMessage(
      senderId,
      chat_id.toString(),
      sendingObject.sending_time,
      sendingObject.message_id.toString(),
    );
    expect(chatMesssageForSender.rowLength).toBe(0);
    const chatMesssageForReciever = await searchChatMessage(
      recieverId,
      chat_id.toString(),
      sendingObject.sending_time,
      sendingObject.message_id.toString(),
    );
    expect(chatMesssageForReciever.rowLength).toBe(0);
  });
});
