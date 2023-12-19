import express from 'express';
import { authMiddlewre } from '../Middlewares/user';
import { ConfessionDb } from '../Database/Models/confession';
import { sendMessageToUser } from '../Functions/sending_message_to_user';
import * as EventNames from '../Constants/event_names'
import { UpdateConfessionStatus } from '../Models/update_status_of_confession';
import { convertUpdateConfessionStatusToCommonMessage } from '../Models/message_handler';
import { client } from '..';
import { createChannel } from '../Queues/base';
const rejectConfession=express.Router();

rejectConfession.post('/reject-confession', authMiddlewre, async(req, res)=>{
   try{
    const {confessionId, time}=req.body
    const confession=await ConfessionDb.findByIdAndUpdate(confessionId, {status: 'Rejected', lastUpdate:time});
    const updateConfssionStatus:UpdateConfessionStatus={
        confessionId:confessionId,
        updatedStatus:'Rejected',
        time:time
    }
    await sendMessageToUser(
        confession?.senderId!,
        true,
        EventNames.updateConfssionStatus,
        updateConfssionStatus,
        convertUpdateConfessionStatusToCommonMessage(updateConfssionStatus),
        req,
        client,
        ()=>{},
        createChannel
    )
    res.status(200).json(true);
   }catch(e: any){
    console.log(e.toString())
    res.status(500).json({'msg': e.message});
   }
})

export {rejectConfession};