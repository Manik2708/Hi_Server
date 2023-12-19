import express from 'express'
import { authMiddlewre } from '../Middlewares/user';
import { markConfessionAsRead } from '../Functions/mark_confession_as_read';
import { client } from '..';
export const readConfession=express.Router();

readConfession.post('/read-confession', authMiddlewre, async(req, res)=>{
    try{
        const {userId, confessionId, time}=req.body;
    markConfessionAsRead(client, req, userId, confessionId, time);
    return res.status(200);
    }catch(e: any){
        return res.status(500).json({'msg': e.message})
    }
})