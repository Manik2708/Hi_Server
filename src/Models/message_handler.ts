import { MessageType } from '../Constants/messasge_type';
import { ChatMessageModel } from './chat_message_model';
import { ChatModel } from './chat_model';
import { ConfessionModel } from './confession';
import {
  DeleteMessageModel,
  UpdateStatusOfChatMessageModel,
} from './update_status_of_chat_message';
import {
  AcceptConfessionStatus,
  UpdateConfessionStatusForSender,
} from './update_status_of_confession';

export type MessageHandler =
  | ({ messageType: number } & ConfessionModel)
  | UpdateConfessionStatusForSender
  | ChatModel
  | AcceptConfessionStatus
  | ChatMessageModel
  | UpdateStatusOfChatMessageModel[]
  | DeleteMessageModel;

export const covertConfessionToCommonMessage = (
  confession: ConfessionModel,
): MessageHandler => {
  return {
    messageType: MessageType.CONFESSION_MESSAGE_TYPE,
    ...confession,
  };
};
export const convertUpdateConfessionStatusToCommonMessage = (
  updatedConfession: UpdateConfessionStatusForSender,
): MessageHandler => {
  return {
    messageType: MessageType.UPDATE_CONFESSION_STATUS,
    ...updatedConfession,
  };
};

export const convertCreateChatMessageToCommonMessage = (
  chat: ChatModel,
): MessageHandler => {
  return {
    messageType: MessageType.CREATE_CHAT_MESSAGE_TYPE,
    ...chat,
  };
};
export const convertAcceptConfessionStatusToCommonMessage = (
  acceptConfession: AcceptConfessionStatus,
): MessageHandler => {
  return {
    messageType: MessageType.ACCEPT_CONFESSION_TYPE,
    ...acceptConfession,
  };
};

export const convertChatMessageToCommonMessage = (
  chatMessageModel: ChatMessageModel,
): MessageHandler => {
  return {
    messageType: MessageType.SEND_CHAT_MESSAGE,
    ...chatMessageModel,
  };
};

export const convertUpdateStatusOfChatMessagesToCommonMessage = (
  updateStatusOfChatMessagesModel: UpdateStatusOfChatMessageModel[],
): MessageHandler => {
  return {
    messageType: MessageType.UPDATE_STATUS_CHAT_MESSAGES,
    ...updateStatusOfChatMessagesModel,
  };
};

export const convertDeleteMessasgeToCommonMessage = (
  deleteMessageModel: DeleteMessageModel,
): MessageHandler => {
  return {
    messageType: MessageType.DELETE_CHAT_MESSASGE,
    ...deleteMessageModel,
  };
};
