import { QueueNames, RedisNames } from "../Constants/queues_redis";
import { User } from "./Models/user";
import { ConfessionModel } from "../Models/confession";
import { createChannel } from "../Queues/base";
import amqp from 'amqplib/callback_api'
import { client } from "..";

export const saveConfessionToDb=async(CrushId: string,confession: ConfessionModel):Promise<boolean>=>{
    try{
        createChannel((sendingChannel: amqp.Channel)=>{
        sendingChannel.assertQueue(QueueNames.ConfessionQueue+CrushId);
        sendingChannel.sendToQueue(QueueNames.ConfessionQueue+CrushId, Buffer.from(JSON.stringify(confession)));
        createChannel((recievingChannel: amqp.Channel)=>{
            recievingChannel.consume(QueueNames.ConfessionQueue+CrushId, async(msg)=>{
                const recievedConfession: ConfessionModel=JSON.parse(msg!.content.toString());
                await User.updateOne({_id: recievedConfession.senderId}, {$push:{sentConfessions: recievedConfession}});
                const lastConfessionId: string|null=await client.get(RedisNames.LastRecievedConfession+recievedConfession.crushId);
                await client.set(RedisNames.LastRecievedConfession+recievedConfession.crushId, recievedConfession.id);
                // linked list is created with latest recieved confession as head and last recieved confession as tail
                if(lastConfessionId==null){
                    // if at any point of time we need tail of Linked List
                    await client.set(RedisNames.FirstRecievedConfession+recievedConfession.crushId, recievedConfession.id);
                    // no need to save confession id in database as the key name already consists confession id!
                    await client.hSet(RedisNames.RecievedConfessions+recievedConfession.id, {
                        senderId: recievedConfession.senderId,
                        confession:recievedConfession.confession,
                        senderAnonymousId:recievedConfession.senderAnonymousId,
                        time:recievedConfession.time,
                    })
                }
                else{
                    await client.hSet(RedisNames.RecievedConfessions+recievedConfession.id, {
                        senderId: recievedConfession.senderId,
                        confession:recievedConfession.confession,
                        senderAnonymousId:recievedConfession.senderAnonymousId,
                        time:recievedConfession.time,
                        nextConfessionId:lastConfessionId
                    })
                     // linking the newly added confession to last old confession
                    await client.hSet(RedisNames.RecievedConfessions+lastConfessionId, {
                        previousConfessionId:recievedConfession.id
                    })
                }
                recievingChannel.ack(msg!);
                },
                {
                    noAck: false
                }
                )
        })
        },
        )
        return true
    }
    catch(e: any){
        console.log(e.toString());
        return false;
    }
}
