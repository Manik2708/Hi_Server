import { types } from 'cassandra-driver';

export interface ChatMessageModel {
  message_id: types.TimeUuid;
  chat_id: types.TimeUuid;
  sender_id: string;
  reciever_id: string;
  message: string;
  sending_time: Date;
  delievery_time?: Date;
  reading_time?: Date;
  status: string;
  referred_by: types.TimeUuid;
  owner_id: string;
}
