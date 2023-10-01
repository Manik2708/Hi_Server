import express from 'express';
import { User } from '../Database/Models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jwt-simple'
const login=express.Router();

login.post('/login',async (req, res) => {
    try{
        const {identify, password}= req.body;
    const user=await User.findOne({email: identify},{sentConfessions:0,recievedConfessions:0});
    if(user==null){
        return res.status(400).json({'msg': 'No user exists with this username or email address'});
    }
    
    const ifCorrectPassword=await bcrypt.compare(password, user.password.toString());
    if(!ifCorrectPassword){
        return res.status(400).json({'msg': 'Wrong password, Try again!'});
    }
    const token=jwt.encode({id: user._id}, 'token');
    res.json({token: token, ...user._doc});
    }catch(e: any){
        res.status(500).json({"msg": e.message});
    }
})

export {login};