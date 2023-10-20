import {Schema, model} from 'mongoose';
import { ChatMessageModel } from '../../Models/chat_message_model';

export const chatMessageSchema=new Schema<ChatMessageModel>(
    {
        chatId:{
            type:String,
            required:true
        },
        senderId:{
            type:String,
            required:true
        },
        message:{
            type:String,
            required:true,
        },
        time:{
            type:Date,
            required:true
        },
        previousMessageId:{
            type:String
        },
        nextMessageId:{
            type:String
        },
        status:{
            type:String,
            required:true
        }
    }
)

const ChatMessageModelDb=model('chatMessage', chatMessageSchema)
export {ChatMessageModelDb}