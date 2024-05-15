export interface UpdateStatusOfChatMessageModel {
  ownerId: string;
  chatId: string;
  messageId: string;
  sendingTime: Date;
  status: string;
  updateTime: Date;
  senderId: string;
}

export interface UpdateStatusOfChatMessages {
  crushId: string;
  updatedStatus: number;
  updateStatusOfChatMessageModel: UpdateStatusOfChatMessageModel[];
}

export interface DeleteMessageModel {
  requesterId: string;
  recieverId: string;
  chatId: string;
  messageId: string;
  sendingTime: Date;
}
