import { types } from 'cassandra-driver';
import { ChatMessageModel } from '../../src/Models/chat_message_model';
import { nanoid } from 'nanoid';
import { TestServiceContainers } from './test_service_containers';
import { CassandraTableNames } from '../../src/Constants/cassandra_constants';

export const createSingleChatMessage = async (
  status: string,
  chat_id: types.TimeUuid,
): Promise<ChatMessageModel> => {
  const sender_id = nanoid().toLowerCase();
  const chatMessageModel: ChatMessageModel = {
    message_id: types.TimeUuid.now(),
    chat_id: chat_id,
    sender_id: sender_id,
    reciever_id: nanoid().toLowerCase(),
    message: nanoid().toLowerCase(),
    sending_time: new Date(),
    status: status,
    owner_id: sender_id,
  };
  const client = TestServiceContainers.getTestingCassandraClient();
  await client.execute(
    `INSERT INTO hi_database.${CassandraTableNames.chatMessages} (
          chat_id,
          message_id,
          sending_time,
          delievery_time,
          reading_time,
          sender_id,
          reciever_id,
          message,
          status,
          owner_id
          ) VALUES(?,?,?,?,?,?,?,?,?,?)`,
    [
      chatMessageModel.chat_id,
      chatMessageModel.message_id,
      chatMessageModel.sending_time.toISOString(),
      chatMessageModel.delievery_time == null
        ? null
        : chatMessageModel.delievery_time.toISOString(),
      chatMessageModel.reading_time == null
        ? null
        : chatMessageModel.reading_time.toISOString(),
      chatMessageModel.sender_id,
      chatMessageModel.reciever_id,
      chatMessageModel.message,
      chatMessageModel.status,
      chatMessageModel.sender_id,
    ],
    {
      prepare: true,
    },
  );
  await client.execute(
    `INSERT INTO hi_database.${CassandraTableNames.chatMessages} (
          chat_id,
          message_id,
          sending_time,
          delievery_time,
          reading_time,
          sender_id,
          reciever_id,
          message,
          status,
          owner_id
          ) VALUES(?,?,?,?,?,?,?,?,?,?)`,
    [
      chatMessageModel.chat_id,
      chatMessageModel.message_id,
      chatMessageModel.sending_time.toISOString(),
      chatMessageModel.delievery_time == null
        ? null
        : chatMessageModel.delievery_time.toISOString(),
      chatMessageModel.reading_time == null
        ? null
        : chatMessageModel.reading_time.toISOString(),
      chatMessageModel.sender_id,
      chatMessageModel.reciever_id,
      chatMessageModel.message,
      chatMessageModel.status,
      chatMessageModel.reciever_id,
    ],
    {
      prepare: true,
    },
  );
  return chatMessageModel;
};

export const createTenChatMessages = async (
  status: string,
): Promise<ChatMessageModel[]> => {
  const chatModelList: ChatMessageModel[] = [];
  const sender_id = nanoid().toLowerCase();
  const reciever_id = nanoid().toLowerCase();
  const chat_id = types.TimeUuid.now();
  for (let i = 0; i < 10; i++) {
    const chatMessageModel: ChatMessageModel = {
      message_id: types.TimeUuid.now(),
      chat_id: chat_id,
      sender_id: sender_id,
      reciever_id: reciever_id,
      message: nanoid().toLowerCase(),
      sending_time: new Date(),
      status: status,
      owner_id: sender_id,
    };
    const client = TestServiceContainers.getTestingCassandraClient();
    await client.execute(
      `INSERT INTO hi_database.${CassandraTableNames.chatMessages} (
              chat_id,
              message_id,
              sending_time,
              delievery_time,
              reading_time,
              sender_id,
              reciever_id,
              message,
              status,
              owner_id
              ) VALUES(?,?,?,?,?,?,?,?,?,?)`,
      [
        chatMessageModel.chat_id,
        chatMessageModel.message_id,
        chatMessageModel.sending_time.toISOString(),
        chatMessageModel.delievery_time == null
          ? null
          : chatMessageModel.delievery_time.toISOString(),
        chatMessageModel.reading_time == null
          ? null
          : chatMessageModel.reading_time.toISOString(),
        chatMessageModel.sender_id,
        chatMessageModel.reciever_id,
        chatMessageModel.message,
        chatMessageModel.status,
        chatMessageModel.sender_id,
      ],
      {
        prepare: true,
      },
    );
    await client.execute(
      `INSERT INTO hi_database.${CassandraTableNames.chatMessages} (
              chat_id,
              message_id,
              sending_time,
              delievery_time,
              reading_time,
              sender_id,
              reciever_id,
              message,
              status,
              owner_id
              ) VALUES(?,?,?,?,?,?,?,?,?,?)`,
      [
        chatMessageModel.chat_id,
        chatMessageModel.message_id,
        chatMessageModel.sending_time.toISOString(),
        chatMessageModel.delievery_time == null
          ? null
          : chatMessageModel.delievery_time.toISOString(),
        chatMessageModel.reading_time == null
          ? null
          : chatMessageModel.reading_time.toISOString(),
        chatMessageModel.sender_id,
        chatMessageModel.reciever_id,
        chatMessageModel.message,
        chatMessageModel.status,
        chatMessageModel.reciever_id,
      ],
      {
        prepare: true,
      },
    );
    chatModelList.push(chatMessageModel);
  }
  return chatModelList;
};
