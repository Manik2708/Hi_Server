import express from 'express';
import { authMiddlewre } from '../Middlewares/user';
import { client } from '..';
import { RedisNames } from '../Constants/queues_redis';
import { UnreadRecievedConfessions } from '../Database/Models/redieved_confessions';

const requestUnreadRecievedConfessions=express.Router();

requestUnreadRecievedConfessions.get('/get-unread-recieved-confessions', authMiddlewre, async(req, res)=>{
   try{
    var lastConfessionId=req.header('confessionId');
    const list:Array<UnreadRecievedConfessions>=[];
    const tryRetrivingFromRedis=await client.get(RedisNames.LastRecievedConfession+res.locals.id)
    if(lastConfessionId=='first-page'){
        if(tryRetrivingFromRedis==null){
            return res.status(200).json({"list": JSON.stringify(list)});
        }
        else{
            lastConfessionId=tryRetrivingFromRedis;
        }
    }
    for(var i=0;i<30;i++){
        const getNextConfessionId:string|undefined =await client.hGet(RedisNames.RecievedConfessions+lastConfessionId, RedisNames.ConfessionLlnextConfessionId)
        if(getNextConfessionId==null||getNextConfessionId==undefined){
            break;
        }
        else{
            lastConfessionId=getNextConfessionId;
        }
        const retrievedConfession:string[]=await client.hmGet(RedisNames.RecievedConfessions+lastConfessionId, [
            RedisNames.ConfessionLlsenderId,
            RedisNames.ConfessionLlconfession,
            RedisNames.ConfessionLlsenderAnonymousId,
            RedisNames.ConfessionLltime,
        ])
        const toSendConfession:UnreadRecievedConfessions={
            senderId:retrievedConfession[0],
            id:lastConfessionId,
            confession:retrievedConfession[1],
            senderAnonymousId:retrievedConfession[2],
            time:retrievedConfession[3]
        }
        list.push(toSendConfession);
    }
    return res.status(200).json({"list": JSON.stringify(list)});
   }
   catch(e:any){
    return res.status(500).json({"msg": e.message});
   }
})
export {requestUnreadRecievedConfessions}