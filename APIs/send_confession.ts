import express from "express";
import { authMiddlewre } from "../Middlewares/user";
import { ConfessionDb } from "../Database/Models/confession";
import { socketfotApis } from "../Websockets/base";
import * as EventNames from "../Constants/event_names"
import { saveConfessionToDb } from "../Database/saving_confession_to_db";
import { getFirebaseToken } from "../Functions/get_firebase_token";
import { sendNotification } from "../Functions/send_notification";
import { covertConfessionToCommonMessage} from "../Models/message_handler";
import { sendMessageToUser } from "../Functions/sending_message_to_user";
const sendConfession=express.Router();

sendConfession.post('/send-confession', authMiddlewre, async(req, res)=>{
    try{
        const {senderId, senderAnonymousId, crushId, confession,  time, crushName}=req.body;
        console.log('api called')
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
    const ifSaved=await saveConfessionToDb(confessionDb)
    if(ifSaved){
        await sendMessageToUser(
            crushId,
            false,
            EventNames.recieveConfession,
            confessionDb,
            covertConfessionToCommonMessage(confessionDb),
            socketfotApis,
            async()=>{
                // const firebaseToken=await getFirebaseToken(confessionDb.crushId)
                // if(firebaseToken=='false'){
                //     console.log('Firebase token error');
                // }
                // else{
                //     sendNotification(firebaseToken, confessionDb);   
                // }
            }
        )
            await ConfessionDb.updateOne({_id: confessionDb._id}, {status: 'Sent'})
            return res.status(200).json(confessionDb)     
    }
    else{
        return res.status(500).json({"msg": 'Confession Not sent!'}); 
    }}
    catch(e: any){
        return res.status(500).json({"msg": e.message});
    }
})
export {sendConfession}