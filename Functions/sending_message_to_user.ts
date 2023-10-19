import { Socket } from "socket.io";
import { client } from "..";
import { QueueNames, RedisNames } from "../Constants/queues_redis";
import { MessageHandler } from "../Models/message_handler";
import { ifUserIsOnline } from "./if_user_online";
import { createChannel } from "../Queues/base";
import amqp from 'amqplib/callback_api'
export const sendMessageToUser=async(
    userId: string, 
    wantTosendNotification:boolean, 
    userIsOnlineEvent: string,
    messageForOnlineUser: any,
    commonMessage: MessageHandler, 
    socket: Socket, 
    sendNotificationFunction:()=>void):Promise<boolean>=>
    {
    try{
    const userIsOnline=await ifUserIsOnline(userId);
    if(userIsOnline){
        const socketid=await client.hGet(RedisNames.OnlineUserMap+userId,RedisNames.SocketId);
        socket.to(socketid!).emit(userIsOnlineEvent, messageForOnlineUser);
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
    return true;
    }catch(e:any){
        console.log(e.toString());
        return sendMessageToUser(
            userId,
            wantTosendNotification,
            userIsOnlineEvent,
            messageForOnlineUser,
            commonMessage,
            socket,
            sendNotificationFunction
        )
    }
}