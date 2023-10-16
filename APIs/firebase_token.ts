import express from 'express'
import { authMiddlewre } from '../Middlewares/user';
import {client} from '..';
import { RedisNames } from '../Constants/queues_redis';
 const saveFirebaseToken=express.Router();

saveFirebaseToken.post('/firebase-token',authMiddlewre, async(req, res)=>{
    try{
    const userId=res.locals.id;
    const {token}=req.body;
   
    await client.hSet('OnlineUserMap'+userId, {
        firebasetoken: token.toString(),
    })
    res.status(200).json({'token': token});
    }catch(e: any){
        res.status(500).json({"msg": e.message});
    }
})

export {saveFirebaseToken};