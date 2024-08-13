import { ChatModel } from './chat_model';
import { ConfessionModel } from './confession';

export interface RetrieveDataAfterLoginModel {
  chats_for_sender: ChatModel[];
  chats_for_crush: ChatModel[];
}

export interface RetrieveConfessionsByCrushId {
  page_state: string;
  confessions: ConfessionModel[];
}
