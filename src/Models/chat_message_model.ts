import { types } from 'cassandra-driver';

export interface ChatMessageModel {
  messageId: types.TimeUuid;
  chatId: types.TimeUuid;
  senderId: string;
  recieverId: string;
  message: string;
  sendingTime: Date;
  delieveryTime?: Date;
  readingTime?: Date;
  status: string;
  referredBy: types.TimeUuid;
  ownerId: string;
}
