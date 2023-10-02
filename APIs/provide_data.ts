import express from 'express';
import { authMiddlewre } from '../Middlewares/user';
import { User } from '../Database/Models/user';
import { ConfessionDb } from '../Database/Models/confession';
const getData=express.Router();

getData.get('/get-user-data', authMiddlewre, async(req, res)=>{
    const user=await User.findById(res.locals.id);
    const sentConfessions=await ConfessionDb.find({_id:{$in: user?.sentConfessions}});
    const recievedConfessions=await ConfessionDb.find({_id:{$in: user?.recievedConfessions}});
    res.json({token: res.locals.token,sentConfessionsList:sentConfessions,recievedConfessionsList: recievedConfessions, ...user?._doc});
})

export {getData};