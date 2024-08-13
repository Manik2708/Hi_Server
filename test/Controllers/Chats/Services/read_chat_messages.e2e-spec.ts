import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import { delay, getTestingApp } from '../../../Helpers/get_testing_app';
import { SendMessageToUserService } from '../../../../src/Services/send_message_to_user';
import { CassandraDatabaseQueries } from '../../../../src/Database/Cassandra/queries';
import { nanoid } from 'nanoid';
import { createTenChatMessages } from '../../../Helpers/create_chat_message';
import { UpdateStatusOfChatMessageModel } from '../../../../package/database/src/Models/update_status_of_chat_message';
import { getTestingGlobalServicesModule } from '../../../Helpers/global_test_services.module';
import { ChatMessageForUserService } from '../../../../src/Controllers/Chats/Services/send_chat_message_service';
import { Socket } from 'socket.io-client';
import { RedisClientType } from '../../../../src/Constants/constant_types';
import { initClientSocket } from '../../../Helpers/create_socket_client';
import { EventNames } from '../../../../package/constants/src/event_names';
import { TestServiceContainers } from '../../../Helpers/test_service_containers';
import { QueueNames, RedisNames } from '../../../../package/constants/src/queues_redis';
import {
  consumeMessageFromAnyQueue,
  consumeMessageFromQueue,
} from '../../../Helpers/consume_message_from_queue';
import { MessageType } from '../../../../package/constants/src/messasge_type';
describe(`Update status of chat messages tests`, () => {
  let redisClient: RedisClientType;
  let app: INestApplication;
  let chatMessageForUserService: ChatMessageForUserService;
  let socketId: string;
  let socket: Socket;
  let outputData: any;
  const senderId = nanoid().toLowerCase();
  beforeAll(async () => {
    redisClient = await TestServiceContainers.getTestingRedisClient().connect();
    const moduleRef = await getTestingGlobalServicesModule();
    app = await getTestingApp(moduleRef);
    chatMessageForUserService = new ChatMessageForUserService(
      moduleRef.get<SendMessageToUserService>(SendMessageToUserService),
      moduleRef.get<CassandraDatabaseQueries>(CassandraDatabaseQueries),
      TestServiceContainers.getTestingRabbitClient(),
    );
    socket = await initClientSocket(senderId, (socket) => {
      socketId = socket.id!;
      socket.on(EventNames.updateStatusOfChatMesssages, (data) => {
        outputData = data;
      });
    });
  });
  afterAll(async () => {
    await app.close();
    socket.disconnect();
  });
  afterEach(async () => {
    await app.close();
    socket.disconnect();
    await delay();
  });
  it(`When user is online`, async () => {
    const recieverId = nanoid().toLowerCase();
    await redisClient.sAdd(RedisNames.OnlineUsers, senderId);
    await redisClient.hSet(RedisNames.OnlineUserMap + senderId, {
      socketId: socketId,
    });
    const updateTime = new Date();
    const chatMessages = await createTenChatMessages('SENT');
    const updateMessageModels: UpdateStatusOfChatMessageModel[] = [];
    for (let i = 0; i < 10; i++) {
      updateMessageModels.push({
        owner_id: recieverId,
        chat_id: chatMessages[i].chat_id.toString(),
        message_id: chatMessages[i].message_id.toString(),
        sending_time: chatMessages[i].sending_time,
        status: 'READ',
        update_time: updateTime,
        sender_id: chatMessages[i].sender_id,
      });
    }
    await chatMessageForUserService.updateStatusOfChatMessages(
      senderId,
      updateMessageModels,
      0,
    );
    const expectedOutput = [];
    for (let i = 0; i < 10; i++) {
      expectedOutput.push({
        owner_id: recieverId,
        chat_id: chatMessages[i].chat_id.toString(),
        message_id: chatMessages[i].message_id.toString(),
        sending_time: chatMessages[i].sending_time.toISOString(),
        status: 'READ',
        update_time: updateTime.toISOString(),
        sender_id: chatMessages[i].sender_id,
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(outputData).toStrictEqual(expectedOutput);
    const message = await consumeMessageFromAnyQueue(
      QueueNames.ReadChatMessageQueue,
    );
    const object = {
      sender_id: senderId,
      updateStatusOfChatMessageModel: expectedOutput,
      status: 0,
    };
    expect(message).toStrictEqual(object);
  });
  it(`When user is offline`, async () => {
    const senderId = nanoid().toLowerCase();
    const recieverId = nanoid().toLowerCase();
    const updateTime = new Date();
    const chatMessages = await createTenChatMessages('SENT');
    const updateMessageModels: UpdateStatusOfChatMessageModel[] = [];
    for (let i = 0; i < 10; i++) {
      updateMessageModels.push({
        owner_id: recieverId,
        chat_id: chatMessages[i].chat_id.toString(),
        message_id: chatMessages[i].message_id.toString(),
        sending_time: chatMessages[i].sending_time,
        status: 'READ',
        update_time: updateTime,
        sender_id: chatMessages[i].sender_id,
      });
    }
    await chatMessageForUserService.updateStatusOfChatMessages(
      senderId,
      updateMessageModels,
      0,
    );
    const expectedOutput = [];
    for (let i = 0; i < 10; i++) {
      expectedOutput.push({
        owner_id: recieverId,
        chat_id: chatMessages[i].chat_id.toString(),
        message_id: chatMessages[i].message_id.toString(),
        sending_time: chatMessages[i].sending_time.toISOString(),
        status: 'READ',
        update_time: updateTime.toISOString(),
        sender_id: chatMessages[i].sender_id,
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    const messageForSender = await consumeMessageFromQueue(senderId);
    expect(messageForSender).toStrictEqual({
      message_type: MessageType.UPDATE_STATUS_CHAT_MESSAGES,
      updateStatusOfChatMessagesList: expectedOutput,
    });
  });
});
