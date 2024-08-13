import { ChatModel } from './chat_model';

export interface UpdateConfessionStatus {
  sender_id: string;
  crush_id: string;
  confession_id: string;
  updated_status: string;
  update_time: Date;
  sending_time: Date;
  reading_time: Date;
}

export interface UpdateConfessionStatusForSender {
  confession_id: string;
  updated_status: string;
  update_time: Date;
}

export interface AcceptConfessionStatus {
  chat_model: ChatModel;
  updated_status: string;
  update_time: Date;
}
