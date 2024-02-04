import { Schema, model } from 'mongoose';
import { ChatModel } from '../../Models/chat_model';

export const chatModelSchema = new Schema<ChatModel>({
  crushId: {
    type: String,
    required: true,
  },
  anonymousUserId: {
    type: String,
    required: true,
  },
  lastMessage: {
    type: String,
  },
  lastUpdate: {
    type: Date,
  },
  confessionId: {
    type: String,
    required: true,
  },
});

const ChatModelDb = model('chatModel', chatModelSchema);

export { ChatModelDb };
