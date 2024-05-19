import { types } from 'cassandra-driver';
import { nanoid } from 'nanoid';
import { ChatModel } from '../../src/Models/chat_model';
import { createTenChatMessages } from './create_chat_message';
import { TestServiceContainers } from './test_service_containers';
import { CassandraTableNames } from '../../src/Constants/cassandra_constants';

export const createChatWithTenMessages = async (
  user_id: string,
  isCrush: boolean,
): Promise<ChatModel> => {
  const chat_id = types.TimeUuid.now();
  const client = TestServiceContainers.getTestingCassandraClient();
  const messages = await createTenChatMessages('SENT', user_id, chat_id);
  const chatModel: ChatModel = {
    chat_id: chat_id,
    crush_name: nanoid().toLowerCase(),
    crush_id: isCrush == true ? user_id : nanoid().toLowerCase(),
    user_id: isCrush == false ? user_id : nanoid().toLowerCase(),
    anonymous_id: nanoid().toLowerCase(),
    last_update: new Date(),
    confession_id: types.TimeUuid.now().toString(),
    messages: messages,
  };
  await client.execute(
    `INSERT INTO hi_database.${CassandraTableNames.chatsForSender} (
          chat_id,
          crush_name,
          crush_id,
          user_id,
          confession_id,
          last_update
        ) VALUES(?,?,?,?,?,?)`,
    [
      chatModel.chat_id,
      chatModel.crush_name,
      chatModel.crush_id,
      chatModel.user_id,
      chatModel.confession_id,
      chatModel.last_update.toISOString(),
    ],
    {
      prepare: true,
    },
  );

  await client.execute(
    `INSERT INTO hi_database.${CassandraTableNames.chatsForCrush} (
          chat_id,
          crush_id,
          user_id,
          anonymous_id,
          confession_id,
          last_update
        ) VALUES(?,?,?,?,?,?)`,
    [
      chatModel.chat_id,
      chatModel.crush_id,
      chatModel.user_id,
      chatModel.anonymous_id,
      chatModel.confession_id,
      chatModel.last_update.toISOString(),
    ],
    {
      prepare: true,
    },
  );
  return chatModel;
};
