import express from 'express';
import { User } from '../Database/Models/user';
import bcrypt from 'bcryptjs';
import {generateOtp, verifyOtp} from 'otp-generator-ts';
const changePassword=express.Router();
import sendmail from 'nodemailer';
changePassword.post('/send-otp-change-password', async(req, res)=>{
    try{
        const {identify}= req.body;
    const user=await User.findOne({email: identify});
    if(user==null){
        return res.status(400).json({'msg': 'No user exists with this username or email address'});
    }
    const email=''+user?.email;
    const otp= generateOtp(6, '10m', 'emailotp');
    let transporter=sendmail.createTransport(
        {
            service: 'gmail',
            auth:{
                user: 'mehtamanik96@gmail.com',
                pass: 'odaejpdmyojhzwkr'
            }
        }
    )
    transporter.sendMail({
        from: 'mehtamanik96@gmail.com',
        to: email,
        subject: 'Change Password',
        text: 'Your OTP is '+otp.otp+'. Please see that this OTP is valid only for 10 Minutes'
    },
    (err, data)=>{
        if(err){
            return res.status(400).json({'msg': err.message})
        }
        else{
            return res.json({'otptoken': otp.token, 'id': user._id, 'email': user.email});
        }
    }
    )
    }catch(e: any){
        res.status(500).json({'msg': e.message});
       }
})

changePassword.post('/change-password', async(req, res)=>{
    try{
        const {otptoken, id, otp, password}= req.body;
    const user= await User.findById(id);
    if(user==null){
        return res.status(400).json({'msg': 'No user found'});
    }
    const verify=verifyOtp(parseInt(otp), otptoken)
    if(!verify){
        return res.status(400).json({'msg': 'Wrong OTP!'});
    }
    const hashedPassword=await bcrypt.hash(password, 8);
    await User.findByIdAndUpdate(id, {password: hashedPassword}, {new:true});
    res.json(true);
    }catch(e: any){
        res.status(500).json({'msg': e.message});
       }
})

export {changePassword};