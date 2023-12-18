import { Request } from 'express';
import { QueueNames, RedisNames } from "../Constants/queues_redis";
import { MessageHandler } from "../Models/message_handler";
import { ifUserIsOnline } from "./if_user_online";
import { createChannel } from "../Queues/base";
import amqp from 'amqplib/callback_api'
import { RedisClientType } from "../Tests/Helpers/redis_db_instance";
export const sendMessageToUser=async(
    userId: string, 
    wantTosendNotification:boolean, 
    userIsOnlineEvent: string,
    messageForOnlineUser: any,
    commonMessage: MessageHandler, 
    req:Request, 
    client:RedisClientType,
    sendNotificationFunction:()=>void):Promise<void>=>
    {
    try{
    const userIsOnline=await ifUserIsOnline(userId, client);
    if(userIsOnline){
        const socketid=await client.hGet(RedisNames.OnlineUserMap+userId,RedisNames.SocketId);
        req.app.get('io').to(socketid!).emit(userIsOnlineEvent, messageForOnlineUser);
    }
    else{
        createChannel((sendingChannelForOfflineUser: amqp.Channel)=>{
            sendingChannelForOfflineUser.assertQueue(QueueNames.OfflineQueue+userId, {durable: true});
            sendingChannelForOfflineUser.sendToQueue(QueueNames.OfflineQueue+userId, Buffer.from(JSON.stringify(commonMessage)));
        })
        if(wantTosendNotification){
            sendNotificationFunction();
        }

    }
    }catch(e:any){
        console.log(e.toString());
        return sendMessageToUser(
            userId,
            wantTosendNotification,
            userIsOnlineEvent,
            messageForOnlineUser,
            commonMessage,
            req,
            client,
            sendNotificationFunction
        )
    }
}