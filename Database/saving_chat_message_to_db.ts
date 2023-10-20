import { QueueNames } from "../Constants/queues_redis";
import { ChatMessageModel } from "../Models/chat_message_model";
import { createChannel } from "../Queues/base";
import amqp from 'amqplib/callback_api'
import { ChatModelDb } from "./Models/chat";
import { ChatMessageModelDb } from "./Models/chat_message";
export const saveChatMessageToDb=async(message: ChatMessageModel):Promise<void>=>{
    try{
        createChannel((sendingChannel: amqp.Channel)=>{
            sendingChannel.assertQueue(QueueNames.CommonMessageSavingQueue);
            sendingChannel.sendToQueue(QueueNames.CommonMessageSavingQueue, Buffer.from(JSON.stringify(message)));
            },
            )
            createChannel((recievingChannel: amqp.Channel)=>{
                recievingChannel.assertQueue(QueueNames.CommonMessageSavingQueue); 
                recievingChannel.consume(QueueNames.CommonMessageSavingQueue, async(msg)=>{
                    if(msg==null){
                        return;
                    }
                    const retrivedMessage: ChatMessageModel=JSON.parse(msg.content.toString()!);
                    const chat=await ChatModelDb.findByIdAndUpdate(retrivedMessage.chatId, {lastMessage: message._id, lastUpdate: retrivedMessage.time})
                    if(chat?.lastMessage==null){
                        // this means it is the very first message, as we have alraedy updated the chat, no need to proceed further
                        return;
                    }
                    const lastMessage=await ChatMessageModelDb.findByIdAndUpdate(chat?.lastMessage, {previousMessageId: message._id})
                    await ChatMessageModelDb.findByIdAndUpdate(message._id, {nextMessageId:lastMessage?._id})
                    recievingChannel.ack(msg) 
                },
                {
                    noAck: false
                }
                )
            }
            )
    }catch(e: any){
        console.log(e.toString())
    }
}