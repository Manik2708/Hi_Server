import express from 'express';
import { User } from '../Database/Models/user';
import bcrypt from 'bcryptjs';
import { authMiddlewre } from '../Middlewares/user';

const changeEmail=express.Router();

changeEmail.post('/change-email',authMiddlewre, async(req, res)=>{
    try{
        const {password, email}=req.body;
        const user=await User.findById(res.locals.id);
        if(user==null){
            return res.status(400).json({'msg': 'No user found'});
        }
        const ifCorrectPassword=await bcrypt.compare(password, user.password.toString());
        if(!ifCorrectPassword){
            return res.status(400).json({'msg': 'Wrong Password'});
        }
        const updatedUser=await User.findByIdAndUpdate(res.locals.id, {email:email}, {new: true});
        res.json(true);
    }catch(e: any){
        res.status(500).json({'msg': e.message});
       }
})

export {changeEmail};