import { types } from 'cassandra-driver';
import { CassandraTableNames } from '../../Constants/cassandra_constants';
import {
  DeleteMessageModel,
  UpdateStatusOfChatMessageModel,
} from '../../Models/update_status_of_chat_message';
import { ChatModelForCrush, ChatModelForSender } from '../../Models/chat_model';
import { ChatMessageModel } from '../../Models/chat_message_model';
import { ConfessionModel } from '../../Models/confession';
type ParamsType = Date | string;
export class CassandraQueryHelper {
  ifEveryMessageHaveSameChatId = (
    chatMessages: UpdateStatusOfChatMessageModel[] | DeleteMessageModel[],
  ): boolean => {
    const chatId = chatMessages[0].chat_id;
    return (
      chatMessages.filter((chatMessages) => chatMessages.chat_id == chatId)
        .length == chatMessages.length
    );
  };
  getMultipleUpdateQueriesForReadingMessages = (n: number): string => {
    const query = `UPDATE ${CassandraTableNames.chatMessages} SET status = ?, reading_time = ? WHERE owner_id = ? AND chat_id = ? AND sending_time = ? AND message_id=?`;
    return query.repeat(n);
  };
  getMultipleQueriesForDeletingMessages = (n: number): string => {
    const query = `DELETE ${CassandraTableNames.chatMessages} WHERE owner_id = ? AND chat_id = ? AND sending_time = ? AND message_id=?`;
    return query.repeat(n);
  };
  getMultipleUpdateQueriesForDelieveredMessages = (n: number): string => {
    const query = `UPDATE ${CassandraTableNames.chatMessages} SET status = ?, delievery_time =? WHERE owner_id = ? AND chat_id = ? AND sending_time = ? AND message_id=?`;
    return query.repeat(n);
  };
  getParametersForReadingMessages = (
    chatMessages: UpdateStatusOfChatMessageModel[],
  ): ParamsType[] => {
    const paramsArray: ParamsType[] = [];
    chatMessages.forEach((chatMessages) => {
      paramsArray.push(chatMessages.status);
      paramsArray.push(chatMessages.update_time);
      paramsArray.push(chatMessages.owner_id);
      paramsArray.push(chatMessages.chat_id);
      paramsArray.push(chatMessages.sending_time);
      paramsArray.push(chatMessages.message_id);
    });
    return paramsArray;
  };
  getParametersForReadingMessagesForSender = (
    chatMessages: UpdateStatusOfChatMessageModel[],
  ): ParamsType[] => {
    const paramsArray: ParamsType[] = [];
    chatMessages.filter((chatMessages) => () => {
      paramsArray.push(chatMessages.status);
      paramsArray.push(chatMessages.update_time);
      paramsArray.push(chatMessages.sender_id);
      paramsArray.push(chatMessages.chat_id);
      paramsArray.push(chatMessages.sending_time);
      paramsArray.push(chatMessages.message_id);
    });
    return paramsArray;
  };
  getParametersForDeletingMessages = (
    deleteMessageModel: DeleteMessageModel[],
  ): string[] => {
    const paramsArray: string[] = [];
    deleteMessageModel.filter((chatMessages) => () => {
      paramsArray.push(chatMessages.requester_id);
      paramsArray.push(chatMessages.chat_id);
      paramsArray.push(chatMessages.sending_time.toString());
      paramsArray.push(chatMessages.message_id);
    });
    return paramsArray;
  };
  parseChatForSenderFromCassandraRow(chats_row: types.Row): ChatModelForSender {
    return {
      chat_id: chats_row.get('chat_id'),
      crush_name: chats_row.get('crush_name'),
      crush_id: chats_row.get('crush_id'),
      user_id: chats_row.get('user_id'),
      last_update: chats_row.get('last_update'),
      confession_id: chats_row.get('confession_id'),
      messages: [],
    };
  }
  parseChatForCrushFromCassandraRow(chats_row: types.Row): ChatModelForCrush {
    return {
      chat_id: chats_row.get('chat_id'),
      anonymous_id: chats_row.get('anonymous_id'),
      crush_id: chats_row.get('crush_id'),
      user_id: chats_row.get('user_id'),
      last_update: chats_row.get('last_update'),
      confession_id: chats_row.get('confession_id'),
      messages: [],
    };
  }
  parseChatMessageFromCassandraRow(
    chat_message_row: types.Row,
  ): ChatMessageModel {
    return {
      message_id: chat_message_row.get('message_id'),
      chat_id: chat_message_row.get('chat_id'),
      sender_id: chat_message_row.get('sender_id'),
      reciever_id: chat_message_row.get('reciever_id'),
      message: chat_message_row.get('message'),
      sending_time: chat_message_row.get('sending_time'),
      status: chat_message_row.get('status'),
      referred_by: chat_message_row.get('reffered_by'),
      owner_id: chat_message_row.get('owner_id'),
      reading_time: chat_message_row.get('reading_time'),
      delievery_time: chat_message_row.get('delievery_time'),
    };
  }
  parseConfessionFromCassandraRow(
    chat_message_row: types.Row,
  ): ConfessionModel {
    return {
      confession_id: chat_message_row.get('confession_id'),
      sender_id: chat_message_row.get('sender_id'),
      sender_anonymous_id: chat_message_row.get('anonymous_id'),
      crush_id: chat_message_row.get('crush_id'),
      confession: chat_message_row.get('confession'),
      status: chat_message_row.get('status'),
      crush_name: chat_message_row.get('crush_name'),
      sending_time: chat_message_row.get('sending_time'),
      reaction_time: chat_message_row.get('reaction_time'),
      reading_time: chat_message_row.get('reading_time'),
    };
  }
}
