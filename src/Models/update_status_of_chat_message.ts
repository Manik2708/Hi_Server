export interface UpdateStatusOfChatMessageModel {
  owner_id: string;
  chat_id: string;
  message_id: string;
  sending_time: Date;
  status: string;
  update_time: Date;
  sender_id: string;
}

export interface UpdateStatusOfChatMessages {
  crush_id: string;
  updated_status: number;
  update_status_of_chat_message_model: UpdateStatusOfChatMessageModel[];
}

export interface DeleteMessageModel {
  requester_id: string;
  reciever_id: string;
  chat_id: string;
  message_id: string;
  sending_time: Date;
}
