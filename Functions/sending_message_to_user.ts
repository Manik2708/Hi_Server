import { Request } from 'express';
import { QueueNames, RedisNames } from "../Constants/queues_redis";
import { MessageHandler } from "../Models/message_handler";
import { ifUserIsOnline } from "./if_user_online";
import { RedisClientType } from "../Tests/Helpers/redis_db_instance";
import amqp from 'amqplib/callback_api'
export const sendMessageToUser=async(
    userId: string, 
    wantTosendNotification:boolean, 
    userIsOnlineEvent: string,
    messageForOnlineUser: any,
    commonMessage: MessageHandler, 
    req:Request, 
    client:RedisClientType,
    sendNotificationFunction:()=>void,
    rabbitMQCallback:(callback:(chnl:amqp.Channel)=>void)=>void,
    afterAcknowledgement?:()=>void,
    ):Promise<void>=>
    {
    try{
    const userIsOnline=await ifUserIsOnline(userId, client);
    if(userIsOnline){
        const socketid=await client.hGet(RedisNames.OnlineUserMap+userId,RedisNames.SocketId);
        // An acknowledgement is required from client that message is delievered, only if it is delievered then message is saved to DB
        // TODO: If no ack is there then we have to think of saving this same confession somewhere else!
        req.app.get('io').to(socketid!).emit(userIsOnlineEvent, messageForOnlineUser, (ack:string)=>{
            if(afterAcknowledgement){
                afterAcknowledgement();
            }
        });
    }
    else{
        if(afterAcknowledgement){
            afterAcknowledgement();
        }
        rabbitMQCallback((sendingChannelForOfflineUser: amqp.Channel)=>{
            sendingChannelForOfflineUser.assertQueue(QueueNames.OfflineQueue+userId, {durable: true});
            sendingChannelForOfflineUser.sendToQueue(QueueNames.OfflineQueue+userId, Buffer.from(JSON.stringify(commonMessage)));
        })
        if(wantTosendNotification){
            sendNotificationFunction();
        }
    }
    }catch(e:any){
        console.log(e.toString());
    }
}