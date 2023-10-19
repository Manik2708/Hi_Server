import express from 'express';
import { authMiddlewre } from '../Middlewares/user';
import { client } from '..';
import { RedisNames } from '../Constants/queues_redis';
import { UnreadRecievedConfessions } from '../Models/unread_recieved_confessions';
import { RedisFunctions } from '../Database/Redis/redis_functions';

const requestUnreadRecievedConfessions=express.Router();

requestUnreadRecievedConfessions.get('/get-unread-recieved-confessions', authMiddlewre, async(req, res)=>{
   try{
    console.log('inside api');
    var lastConfessionId=req.header('confessionId');
    const list:Array<UnreadRecievedConfessions>=[];
    const tryRetrivingFromRedis=await client.get(RedisNames.LastRecievedConfession+res.locals.id)
    if(lastConfessionId=='first-page'){
        if(tryRetrivingFromRedis==null){
            console.log('here1')
            return res.status(200).json({"list": JSON.stringify(list)});
        }
        else{
            console.log('here2')
            lastConfessionId=tryRetrivingFromRedis;
        }
    }
    for(var i=0;i<30;i++){
        console.log('hello'+i);
        const getNextConfessionId:string|undefined =await client.hGet(RedisNames.RecievedConfessions+lastConfessionId, RedisNames.ConfessionLlnextConfessionId)
        
        if(getNextConfessionId==null||getNextConfessionId==undefined){
            break;
        }
        else{
            lastConfessionId=getNextConfessionId;
        }
        const confessionToSend=await RedisFunctions.getUnreadRecievedConfessionById(lastConfessionId)
        if(confessionToSend!=null){
            list.push(confessionToSend);
        }
    }
    console.log('api closed');
    return res.status(200).json({"list": JSON.stringify(list)});
   }
   catch(e:any){
    return res.status(500).json({"msg": e.message});
   }
})
export {requestUnreadRecievedConfessions}