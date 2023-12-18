import express from 'express';
import { authMiddlewre } from '../Middlewares/user';
import { client } from '..';
import { UnreadRecievedConfessions } from '../Models/unread_recieved_confessions';
import { requestUnreadRecievedConfessionsFxn } from '../Functions/request_recieved_confessions_function';

const requestUnreadRecievedConfessions=express.Router();

requestUnreadRecievedConfessions.get('/get-unread-recieved-confessions', authMiddlewre, async(req, res)=>{
   try{
    console.log('inside api');
    var lastConfessionId=req.header('confessionId');
    const list:Array<UnreadRecievedConfessions>=await requestUnreadRecievedConfessionsFxn(client,lastConfessionId!, res.locals.id);
    console.log('api closed');
    return res.status(200).json({"list": JSON.stringify(list)});
   }
   catch(e:any){
    return res.status(500).json({"msg": e.message});
   }
})
export {requestUnreadRecievedConfessions}