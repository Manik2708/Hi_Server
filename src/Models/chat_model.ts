import mongoose from "mongoose";
export interface ChatModel extends mongoose.Document {
  crushId: string;
  anonymousUserId: string;
  lastMessage: string | null;
  lastUpdate: Date;
  confessionId: string;
}
