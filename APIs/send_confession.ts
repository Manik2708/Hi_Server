import express from "express";
import { authMiddlewre } from "../Middlewares/user";
import { ConfessionDb } from "../Database/Models/confession";
import * as EventNames from "../Constants/event_names"
import { saveConfessionToDb } from "../Database/saving_confession_to_db";
import { covertConfessionToCommonMessage} from "../Models/message_handler";
import { sendMessageToUser } from "../Functions/sending_message_to_user";
import { client } from '..';

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
    const ifSaved=await saveConfessionToDb(confessionDb, client)
    if(ifSaved){
        await sendMessageToUser(
            crushId,
            false,
            EventNames.recieveConfession,
            confessionDb,
            covertConfessionToCommonMessage(confessionDb),
            req,
            client,
            async()=>{},
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