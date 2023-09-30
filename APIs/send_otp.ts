
import express from 'express';
import { authMiddlewre } from '../Middlewares/user';
import { User } from '../Database/Models/user';
import {generateOtp} from 'otp-generator-ts';
const sendOTP=express.Router();
import sendmail from 'nodemailer';

sendOTP.post('/send-otp', authMiddlewre, async(req, res)=>{
    try{
        const user=await User.findById(res.locals.id);
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
        subject: 'Verify Your Email Address',
        text: 'Your OTP is '+otp.otp+'. Please see that this OTP is valid only for 10 Minutes'
    },
    (err, data)=>{
        if(err){
            return res.status(400).json({'msg': err.message})
        }
        else{
            return res.json({'otptoken': otp.token});
        }
    }
    )
    }catch(e: any){
        res.status(500).json({'msg': e.message});
       }

}
)

export {sendOTP};