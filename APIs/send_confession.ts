import express from "express";
import { authMiddlewre } from "../Middlewares/user";
import { ifUserIsOnline } from "../OnlineUsers/if_user_online";
import { ConfessionDb } from "../Database/Models/confession";
import { client } from "..";
import { socketfotApis } from "../Websockets/base";
import * as EventNames from "../Constants/event_names"
import { QueueNames, RedisNames } from "../Constants/queues_redis";
import { saveConfessionToDb } from "../Database/saving_confession_to_db";
import { getFirebaseToken } from "../Functions/get_firebase_token";
import { sendNotification } from "../Functions/send_notification";
import amqp from 'amqplib/callback_api'
import { createChannel } from "../Queues/base";
import { covertConfessionToCommonMessage, MessageHandler } from "../Models/message_handler";
const sendConfession=express.Router();

sendConfession.post('/send-confession', authMiddlewre, async(req, res)=>{
    try{
        const {senderId, senderAnonymousId, crushId, confession,  time, crushName}=req.body;
        let confessionDb=new ConfessionDb({
        senderId: senderId,
        senderAnonymousId: senderAnonymousId,
        crushId: crushId,
        confession: confession,
        time: time,
        status: 'Sending',
        crushName: crushName
    });
    confessionDb= await confessionDb.save();
    const ifSaved=await saveConfessionToDb(confessionDb.crushId, confessionDb)
    if(ifSaved){
        const userIsOnline=await ifUserIsOnline(crushId);
        await ConfessionDb.updateOne({_id: confessionDb._id}, {status: 'Sent'})
        if(userIsOnline){
            console.log('user is online')
            const socketid=await client.hGet(RedisNames.OnlineUserMap+crushId,RedisNames.SocketId);
            socketfotApis.to(socketid!).emit(EventNames.recieveConfession, confessionDb);
            return res.status(200).json(confessionDb)
        }
        else{
            console.log('user is offline')
            const firebaseToken=await getFirebaseToken(confessionDb.crushId)
            if(firebaseToken=='false'){
                console.log('Firebase token error');
                return res.status(500).json({"msg": 'Please re-send confession'}); 
            }
            else{
                createChannel((sendingChannelForOfflineUser: amqp.Channel)=>{
                    const message: MessageHandler=covertConfessionToCommonMessage(confessionDb);
                    sendingChannelForOfflineUser.assertQueue(QueueNames.OfflineQueue+confessionDb.crushId, {durable: true});
                    sendingChannelForOfflineUser.sendToQueue(QueueNames.OfflineQueue+confessionDb.crushId, Buffer.from(JSON.stringify(message)));
                })
               sendNotification(firebaseToken, confessionDb);   
            return res.status(200).json(confessionDb);
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