import {
  describe,
  it,
  expect,
  beforeAll,
  afterEach,
} from '@jest/globals';
import { delay } from '../../../Helpers/get_testing_app';
import { SendMessageToUserService } from '../../../../src/Services/send_message_to_user';
import { CassandraDatabaseQueries } from '../../../../src/Database/Cassandra/queries';
import { nanoid } from 'nanoid';
import { createTenChatMessages } from '../../../Helpers/create_chat_message';
import { DeleteMessageModel } from '../../../../src/Models/update_status_of_chat_message';
import {
  TestServiceModule,
  getTestingGlobalServicesModule,
} from '../../../Helpers/global_test_services.module';
import { ChatMessageForUserService } from '../../../../src/Controllers/Chats/Services/send_chat_message_service';
import { TestServiceContainers } from '../../../Helpers/test_service_containers';
import { QueueNames } from '../../../../src/Constants/queues_redis';
import { consumeMessageFromAnyQueue } from '../../../Helpers/consume_message_from_queue';
describe(`Update status of chat messages tests`, () => {
  let chatMessageForUserService: ChatMessageForUserService;
  beforeAll(async () => {
    const moduleRef = await TestServiceModule.getTestingModule();
    chatMessageForUserService = new ChatMessageForUserService(
      moduleRef.get<SendMessageToUserService>(SendMessageToUserService),
      moduleRef.get<CassandraDatabaseQueries>(CassandraDatabaseQueries),
      TestServiceContainers.getTestingRabbitClient(),
    );
  });
  afterEach(async () => {
    await delay();
  });
  it(`Data sent to database queue`, async () => {
    const senderId = nanoid().toLowerCase();
    const recieverId = nanoid().toLowerCase();
    const chatMessages = await createTenChatMessages('READ');
    const updateMessageModels: DeleteMessageModel[] = [];
    for (let i = 0; i < 10; i++) {
      updateMessageModels.push({
        requester_id: senderId,
        chat_id: chatMessages[i].chat_id.toString(),
        reciever_id: recieverId,
        message_id: chatMessages[i].message_id.toString(),
        sending_time: chatMessages[i].sending_time,
      });
    }
    await chatMessageForUserService.deleteChatMessageForMe(updateMessageModels);
    const expectedOutput = [];
    for (let i = 0; i < 10; i++) {
      expectedOutput.push({
        requester_id: senderId,
        chat_id: chatMessages[i].chat_id.toString(),
        reciever_id: recieverId,
        message_id: chatMessages[i].message_id.toString(),
        sending_time: chatMessages[i].sending_time.toISOString(),
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    const message = await consumeMessageFromAnyQueue(
      QueueNames.DeleteMessageForMeQueue,
    );
    expect(message).toStrictEqual(expectedOutput);
  });
});
