import express from 'express'
import { ConfessionDb } from '../Database/Models/confession';
import { ChatModelDb } from '../Database/Models/chat';
import { authMiddlewre } from '../Middlewares/user';
import { sendMessageToUser } from '../Functions/sending_message_to_user';
import { UpdateConfessionStatus } from '../Models/update_status_of_confession';
import * as EventNames from '../Constants/event_names'
import { convertCreateChatMessageToCommonMessage, convertUpdateConfessionStatusToCommonMessage } from '../Models/message_handler';
import { client } from '..';
import { createChannel } from '../Queues/base';
const acceptConfession=express.Router()


acceptConfession.post('/accept-confession',authMiddlewre, async(req, res)=>{
   try{
    const {confessionId, time}=req.body;
    const confession=await ConfessionDb.findByIdAndUpdate(confessionId, {status: 'Accepted', lastUpdate:time});
    if(confession==null){
        return res.status(500).json({'msg': 'Error!'})
    }
    let chat=new ChatModelDb(
        {
            crushId: confession.id,
            anonymousUserId: confession.senderId,
            confessionId: confession._id
        }
    )
    const savedChat=await chat.save()
    const updateConfssionStatus:UpdateConfessionStatus={
        confessionId:confessionId,
        updatedStatus:'Accpeted',
        time:time
    }
    await sendMessageToUser(
        confession.senderId!,
        true,
        EventNames.updateConfssionStatus,
        updateConfssionStatus,
        convertUpdateConfessionStatusToCommonMessage(updateConfssionStatus),
        req,
        client,
        ()=>{},
        createChannel
    )
    await sendMessageToUser(
        confession.senderId!,
        false,
        EventNames.createChat,
        savedChat.toJSON(),
        convertCreateChatMessageToCommonMessage(savedChat),
        req,
        client,
        ()=>{},
        createChannel
    )
    return res.status(200).json(savedChat)
   }catch(e: any){
    return res.status(500).json({'msg': e.message})
   }
})