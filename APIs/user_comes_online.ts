import express from 'express'
import { authMiddlewre } from '../Middlewares/user';
import { userOnline } from '../Functions/set_user_online';
import { client } from '..';
export const userIsOnline=express.Router();

userIsOnline.get('user-is-online', authMiddlewre, (req, res)=>{
    try{
        const userId=res.locals.id
        const socketId=req.header('socketId');
        userOnline(userId, socketId!, client);  
        return res.status(200)
    }catch(e:any){
        return res.status(500).json({'msg': e.message})
    }
})