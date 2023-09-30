import express from 'express';
import { authMiddlewre } from '../Middlewares/user';
import { User } from '../Database/Models/user';
import {verifyOtp} from 'otp-generator-ts';
const verifyOTP=express.Router();

verifyOTP.post('/verify-email', authMiddlewre, async(req, res)=>{
    try{
    const {otp, otptoken}=req.body;
    const isVerified=verifyOtp(parseInt(otp), otptoken, 'emailotp');
    if(isVerified){
        await User.findByIdAndUpdate(res.locals.id, {isEmailVerified: true}, {new: true});
        res.json(true);
    }
    else{
        res.status(400).json({'msg': "Verification failed"});
    }
    }catch(e: any){
        res.status(500).json({'msg': e.message});
       }
})

export {verifyOTP};