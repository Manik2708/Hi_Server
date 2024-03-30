export interface UpdateStatusOfChatMessageModel{
    chatId: string;
    messageId: string;
    sendingTime: Date;
    status: string;
    updateTime: Date;
}

export interface DeleteMessageModel{
    requesterId: string;
    chatId: string;
    messageId: string;
    sendingTime: Date;
}