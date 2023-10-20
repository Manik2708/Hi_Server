import mongoose from "mongoose"

export interface ChatMessageModel extends mongoose.Document{
    chatId:string,
    senderId:string
    message:string,
    time:Date,
    previousMessageId:string|null,
    nextMessageId:string|null,
    status:string
}