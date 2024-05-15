import { types } from 'cassandra-driver';
import { ChatMessageModel } from './chat_message_model';

export interface ChatModel {
  chat_id: types.TimeUuid;
  crush_name: string;
  crush_id: string;
  user_id: string;
  anonymous_id: string;
  last_update: Date;
  confession_id: string;
  messages: ChatMessageModel[];
}

export interface ChatModelForSender {
  chat_id: types.TimeUuid;
  crush_name: string;
  crush_id: string;
  user_id: string;
  last_update: Date;
  confession_id: string;
  messages: ChatMessageModel[];
}

export interface ChatModelForCrush {
  chat_id: types.TimeUuid;
  crush_id: string;
  user_id: string;
  anonymous_id: string;
  last_update: Date;
  confession_id: string;
  messages: ChatMessageModel[];
}
