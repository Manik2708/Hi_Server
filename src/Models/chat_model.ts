import { types } from "cassandra-driver";
import { ChatMessageModel } from "./chat_message_model";

export interface ChatModel {
  chatId: types.TimeUuid;
  crushName: string;
  crushId: string;
  userId: string;
  anonymousUserId: string;
  lastUpdate: Date;
  confessionId: string;
  messages: ChatMessageModel[];
}
