import { CassandraTableNames } from '../../Constants/cassandra_constants';
import {
  DeleteMessageModel,
  UpdateStatusOfChatMessageModel,
} from '../../Models/update_status_of_chat_message';

export class CassandraQueryHelper {
  ifEveryMessageHaveSameChatId = (
    chatMessages: UpdateStatusOfChatMessageModel[] | DeleteMessageModel[],
  ): boolean => {
    const chatId = chatMessages[0].chatId;
    return (
      chatMessages.filter((chatMessages) => chatMessages.chatId == chatId)
        .length == chatMessages.length
    );
  };
  getMultipleUpdateQueriesForReadingMessages = (n: number): string => {
    const query = `UPDATE ${CassandraTableNames.chatMessages} SET status = ?, reading_time WHERE owner_id = ? AND chat_id = ? AND sending_time = ? AND message_id=?`;
    return query.repeat(n);
  };
  getMultipleQueriesForDeletingMessages = (n: number): string => {
    const query = `DELETE ${CassandraTableNames.chatMessages} WHERE owner_id = ? AND chat_id = ? AND sending_time = ? AND message_id=?`;
    return query.repeat(n);
  };
  getMultipleUpdateQueriesForDelieveredMessages = (n: number): string => {
    const query = `UPDATE ${CassandraTableNames.chatMessages} SET status = ?, delievery_time WHERE owner_id = ? AND chat_id = ? AND sending_time = ? AND message_id=?`;
    return query.repeat(n);
  };
  getParametersForReadingMessages = (
    chatMessages: UpdateStatusOfChatMessageModel[],
  ): string[] => {
    const paramsArray: string[] = [];
    chatMessages.filter((chatMessages) => () => {
      paramsArray.push(chatMessages.status);
      paramsArray.push(chatMessages.updateTime.toString());
      paramsArray.push(chatMessages.ownerId);
      paramsArray.push(chatMessages.chatId);
      paramsArray.push(chatMessages.sendingTime.toString());
      paramsArray.push(chatMessages.messageId);
    });
    return paramsArray;
  };
  getParametersForDeletingMessages = (
    deleteMessageModel: DeleteMessageModel[],
  ): string[] => {
    const paramsArray: string[] = [];
    deleteMessageModel.filter((chatMessages) => () => {
      paramsArray.push(chatMessages.requesterId);
      paramsArray.push(chatMessages.chatId);
      paramsArray.push(chatMessages.sendingTime.toString());
      paramsArray.push(chatMessages.messageId);
    });
    return paramsArray;
  };
}
