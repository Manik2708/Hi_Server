import { MessageType } from "../Constants/messasge_type";
import { ChatModel } from "./chat_model";
import { ConfessionModel } from "./confession";
import { UpdateConfessionStatusForSender } from "./update_status_of_confession";

export interface MessageHandler {
  messageType: number;
  senderId?: string;
  senderAnonymousId?: string;
  crushId?: string;
  confession?: string;
  time?: string;
  status?: string;
  crushName?: string;
  confessionId?: string;
  confessionUpdatedStatus?: string;
  anonymousUserId?: string;
  updateTime?: string;
}
export const covertConfessionToCommonMessage = (
  confession: ConfessionModel,
): MessageHandler => {
  return {
    messageType: MessageType.CONFESSION_MESSAGE_TYPE,
    senderId: confession.senderId,
    senderAnonymousId: confession.senderAnonymousId,
    crushId: confession.crushId,
    confession: confession.confession,
    time: confession.time,
    status: confession.status,
    crushName: confession.crushName,
  };
};
export const convertUpdateConfessionStatusToCommonMessage = (
  updatedConfession: UpdateConfessionStatusForSender,
): MessageHandler => {
  return {
    messageType: MessageType.UPDATE_CONFESSION_STATUS,
    confessionId: updatedConfession.confessionId,
    confessionUpdatedStatus: updatedConfession.updatedStatus,
    updateTime: updatedConfession.updateTime,
  };
};

export const convertCreateChatMessageToCommonMessage = (
  chat: ChatModel,
): MessageHandler => {
  return {
    messageType: MessageType.CREATE_CHAT_MESSAGE_TYPE,
    crushId: chat.crushId,
    anonymousUserId: chat.anonymousUserId,
    confessionId: chat.confessionId,
  };
};
