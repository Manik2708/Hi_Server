import express from 'express';
import { authMiddlewre } from '../Middlewares/user';
import { User } from '../Database/Models/user';
const getData=express.Router();

getData.get('/get-user-data', authMiddlewre, async(req, res)=>{
    const user=await User.findById(res.locals.id);
    res.json({token: res.locals.token, ...user?._doc});
})

export {getData};