import express from "express";
import { authMiddlewre } from "../Middlewares/user";
import { ifUserIsOnline } from "../OnlineUsers/if_user_online";
import { ConfessionDb } from "../Database/Models/confession";
import { client } from "..";
import { socketfotApis } from "../Websockets/base";
import * as EventNames from "../event_names"
import { QueueNames, RedisNames } from "./queues_redis";
import { saveConfessionToDb } from "../Database/saving_confession_to_db";
import { getFirebaseToken } from "../Functions/get_firebase_token";
import { sendNotification } from "../Functions/send_notification";
import amqp from 'amqplib/callback_api'
import { createChannel } from "../Queues/base";
const sendConfession=express.Router();

sendConfession.post('/send-confession', authMiddlewre, async(req, res)=>{
    try{
        const {SenderId, SenderAnonymousId, CrushId, Confession,  Time}=req.body;
        let confession=new ConfessionDb({
        SenderId: SenderId,
        SenderAnonymousId: SenderAnonymousId,
        CrushId: CrushId,
        Confession: Confession,
        Time: Time,
        status: 'Sending'
    });
    confession= await confession.save();
    const ifSaved=await saveConfessionToDb(confession.CrushId, confession)
    if(ifSaved){
        const userIsOnline=await ifUserIsOnline(CrushId);
        await ConfessionDb.updateOne({_id: confession._id}, {status: 'Sent'})
        if(userIsOnline){
            const socketid=await client.hGet(RedisNames.OnlineUserMap+CrushId,RedisNames.SocketId);
            socketfotApis.to(socketid!).emit(EventNames.recieveConfession, confession);
            return res.status(200).json(confession)
        }
        else{
            const firebaseToken=await getFirebaseToken(confession.CrushId)
            if(firebaseToken=='false'){
                console.log('Firebase token error');
                return res.status(500).json({"msg": 'Please re-send confession'}); 
            }
            else{
                createChannel((sendingChannelForOfflineUser: amqp.Channel)=>{
                    sendingChannelForOfflineUser.assertQueue(QueueNames.OfflineConfessionQueue+confession.CrushId, {durable: true});
                    sendingChannelForOfflineUser.sendToQueue(QueueNames.OfflineConfessionQueue+confession.CrushId, Buffer.from(JSON.stringify(confession)));
                })
               sendNotification(firebaseToken, confession);
                return res.status(200).json(confession);
            }
                }}
    // if there is some error in saving confession we will request the sender to re-send confession            
    else{
        return res.status(500).json({"msg": 'Please re-send confession'}); 
    }
    }catch(e: any){
        return res.status(500).json({"msg": e.message});
    }
})
export {sendConfession}