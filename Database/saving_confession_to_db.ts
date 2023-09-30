import { QueueNames } from "../APIs/queues_redis";
import { User } from "./Models/user";
import { ConfessionModel } from "../Models/confession";
import { createChannel } from "../Queues/base";
import amqp from 'amqplib/callback_api'

export const saveConfessionToDb=async(CrushId: string,confession: ConfessionModel):Promise<boolean>=>{
    try{
        createChannel((sendingChannel: amqp.Channel)=>{
            sendingChannel.assertQueue(QueueNames.ConfessionQueue+CrushId);
        sendingChannel.sendToQueue(QueueNames.ConfessionQueue+CrushId, Buffer.from(JSON.stringify(confession)));
        createChannel((recievingChannel: amqp.Channel)=>{
            recievingChannel.consume(QueueNames.ConfessionQueue+CrushId, async(msg)=>{
                const recievedConfession=JSON.parse(msg!.content.toString());
                await User.updateOne({_id: recievedConfession.SenderId}, {$push:{sentConfessions: recievedConfession}});
                await User.updateOne({_id: recievedConfession.CrushId}, {$push:{recievedConfessions: recievedConfession}});
                })
        })
        })
        return true
    }
    catch(e: any){
        console.log(e.toString());
        return false;
    }
}