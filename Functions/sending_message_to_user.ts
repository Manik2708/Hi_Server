import { Request } from 'express';
import { QueueNames, RedisNames } from "../Constants/queues_redis";
import { MessageHandler } from "../Models/message_handler";
import { ifUserIsOnline } from "./if_user_online";
import { RedisClientType } from "../Tests/Helpers/redis_db_instance";
export const sendMessageToUser=async(
    userId: string, 
    wantTosendNotification:boolean, 
    userIsOnlineEvent: string,
    messageForOnlineUser: any,
    commonMessage: MessageHandler, 
    req:Request, 
    client:RedisClientType,
    sendNotificationFunction:()=>void,):Promise<void>=>
    {
    try{
    const userIsOnline=await ifUserIsOnline(userId, client);
    if(userIsOnline){
        const socketid=await client.hGet(RedisNames.OnlineUserMap+userId,RedisNames.SocketId);
        req.app.get('io').to(socketid!).emit(userIsOnlineEvent, messageForOnlineUser);
    }
    else{
        // TODO: Implement apache Cassandra here
        if(wantTosendNotification){
            sendNotificationFunction();
        }

    }
    }catch(e:any){
        console.log(e.toString());
    }
}