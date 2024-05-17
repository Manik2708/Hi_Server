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
import { createTenChatMessages } from '../../../Helpers/create_chat_message';
import { UpdateStatusOfChatMessageModel } from 'src/Models/update_status_of_chat_message';

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
      chatMessages[0].sender_id,
      updateMessageModels,
      0,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(outputData).toStrictEqual(updateMessageModels);
  });
});
