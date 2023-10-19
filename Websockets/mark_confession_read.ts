import { Socket } from "socket.io";
import { client } from "..";
import { QueueNames, RedisNames } from "../Constants/queues_redis";
import { ConfessionDb } from "../Database/Models/confession";
import { User } from "../Database/Models/user";
import { createChannel } from "../Queues/base";
import amqp from 'amqplib/callback_api'
import { sendMessageToUser } from "../Functions/sending_message_to_user";
import * as EventNames from "../Constants/event_names"
import { UpdateConfessionStatus } from "../Models/update_status_of_confession";
import { convertUpdateConfessionStatusToCommonMessage } from "../Models/message_handler";
export const markConfessionAsRead=(socket: Socket)=>{
   try{
    socket.on('mark-confession-read', async(data)=>{
        createChannel((sendingChannel: amqp.Channel)=>{
            sendingChannel.assertQueue(QueueNames.CommonConfessionReadingQueue);
            sendingChannel.sendToQueue(QueueNames.CommonConfessionReadingQueue, Buffer.from(JSON.stringify(data)));
        })
        createChannel((recievingChannel: amqp.Channel)=>{
            recievingChannel.consume(QueueNames.CommonConfessionSavingQueue, async(msg)=>{
                if(msg==null){
                    return;
                }
                const localData:localRecievedData=JSON.parse(msg.content.toString()!);
                const previousConfessionId=await client.hGet(RedisNames.RecievedConfessions+localData.confessionId, RedisNames.ConfessionLlpreviousConfessionId);
                const nextConfessionId=await client.hGet(RedisNames.RecievedConfessions+localData.confessionId, RedisNames.ConfessionLlnextConfessionId);
                // if a middle confession is read
                if(previousConfessionId!=undefined&&nextConfessionId!=undefined){
                    await client.hSet(RedisNames.RecievedConfessions+previousConfessionId,{
                        nextConfessionId:nextConfessionId
                    }
                    )
                    await client.hSet(RedisNames.RecievedConfessions+nextConfessionId, {
                        previousConfessionId:previousConfessionId
                    })
                }
                // if latest confession is read
                else if(previousConfessionId==null||undefined&&nextConfessionId!=null||undefined){
                    await client.hDel(RedisNames.RecievedConfessions+nextConfessionId, RedisNames.ConfessionLlpreviousConfessionId);
                    await client.set(RedisNames.LastRecievedConfession+data.userId, nextConfessionId!);
                }
                // if the oldest confession is read
                else if(previousConfessionId!=null||undefined&&nextConfessionId==null||undefined){
                    await client.hDel(RedisNames.RecievedConfessions+previousConfessionId, RedisNames.ConfessionLlnextConfessionId);
                    await client.set(RedisNames.FirstRecievedConfession, previousConfessionId);
                }
                // if the only confession is read
                else{
                    await client.del(RedisNames.FirstRecievedConfession);
                    await client.del(RedisNames.LastRecievedConfession);
                }
                await client.del(RedisNames.RecievedConfessions+localData.confessionId);
                const confessionPointer=await ConfessionDb.findByIdAndUpdate(localData.confessionId, {lastUpdate:localData.time});
                await User.findByIdAndUpdate(localData.userId, {$push:{recievedConfessions:confessionPointer}})
                const toNotifySender:UpdateConfessionStatus={
                    confessionId: localData.confessionId,
                    updatedStatus:'Read', 
                    time: localData.time
                }
                await sendMessageToUser(
                    confessionPointer?.senderId!,
                    false,
                    EventNames.updateConfssionStatus,
                    toNotifySender,
                    convertUpdateConfessionStatusToCommonMessage(toNotifySender),
                    socket,
                    ()=>{} 
                )
            }
            )
        }
        )
    })
   }catch(e: any){
    console.log(e.toString());
    // emit an event to resend the updation request
   }
}

interface localRecievedData{
    userId: string,
    confessionId: string,
    time: string
}