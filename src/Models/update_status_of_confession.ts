import { ChatModel } from './chat_model';

export interface UpdateConfessionStatus {
  senderId: string;
  crushId: string;
  confessionId: string;
  updatedStatus: string;
  updateTime: Date;
  sendingTime: Date;
  readingTime: Date;
}

export interface UpdateConfessionStatusForSender {
  confessionId: string;
  updatedStatus: string;
  updateTime: Date;
}

export interface AcceptConfessionStatus {
  chatModel: ChatModel;
  updatedStatus: string;
}
