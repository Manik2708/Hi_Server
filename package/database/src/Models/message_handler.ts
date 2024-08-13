import { MessageType } from 'hi-constants';
import { ChatMessageModel } from './chat_message_model';
import { ChatModel } from './chat_model';
import { ConfessionModel } from './confession';
import {
  DeleteMessageModel,
  UpdateStatusOfChatMessageList,
  UpdateStatusOfChatMessageModel,
} from './update_status_of_chat_message';
import {
  AcceptConfessionStatus,
  UpdateConfessionStatusForSender,
} from './update_status_of_confession';

interface BaseMessage {
  message_type: number;
}

export type MessageHandler =
  | (BaseMessage & ConfessionModel)
  | (BaseMessage & UpdateConfessionStatusForSender)
  | (BaseMessage & ChatModel)
  | (BaseMessage & AcceptConfessionStatus)
  | (BaseMessage & ChatMessageModel)
  | (BaseMessage & UpdateStatusOfChatMessageList)
  | (BaseMessage & DeleteMessageModel);

export const covertConfessionToCommonMessage = (
  confession: ConfessionModel,
): MessageHandler => {
  return {
    message_type: MessageType.CONFESSION_MESSAGE_TYPE,
    ...confession,
  };
};
export const convertUpdateConfessionStatusToCommonMessage = (
  updatedConfession: UpdateConfessionStatusForSender,
): MessageHandler => {
  return {
    message_type: MessageType.UPDATE_CONFESSION_STATUS,
    ...updatedConfession,
  };
};

export const convertCreateChatMessageToCommonMessage = (
  chat: ChatModel,
): MessageHandler => {
  return {
    message_type: MessageType.CREATE_CHAT_MESSAGE_TYPE,
    ...chat,
  };
};
export const convertAcceptConfessionStatusToCommonMessage = (
  acceptConfession: AcceptConfessionStatus,
): MessageHandler => {
  return {
    message_type: MessageType.ACCEPT_CONFESSION_TYPE,
    ...acceptConfession,
  };
};

export const convertChatMessageToCommonMessage = (
  chatMessageModel: ChatMessageModel,
): MessageHandler => {
  return {
    message_type: MessageType.SEND_CHAT_MESSAGE,
    ...chatMessageModel,
  };
};

export const convertUpdateStatusOfChatMessagesToCommonMessage = (
  updateStatusOfChatMessagesModel: UpdateStatusOfChatMessageModel[],
): MessageHandler => {
  return {
    message_type: MessageType.UPDATE_STATUS_CHAT_MESSAGES,
    updateStatusOfChatMessagesList: updateStatusOfChatMessagesModel,
  };
};

export const convertDeleteMessasgeToCommonMessage = (
  deleteMessageModel: DeleteMessageModel,
): MessageHandler => {
  return {
    message_type: MessageType.DELETE_CHAT_MESSASGE,
    ...deleteMessageModel,
  };
};
