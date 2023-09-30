import express from 'express';
import { User } from '../Database/Models/user';
import bcrypt from 'bcryptjs';
import jsonwt from 'jwt-simple';
import mongoose from 'mongoose';
const createAccount=express.Router();

createAccount.post('/create-account-without-verification', async(req, res)=>{
    try{
        const anonymousId=new mongoose.mongo.ObjectId();
        const {name, email, password, username, dob,  isEmailVerified}=req.body;
        const user=await User.findOne({email});
        if(user!=null){
            return res.status(400).json({"msg": "User with same Email or Phone exists. Please Login!"});
        }
        const ifUserNameAvailable=await User.findOne({username});
        if(ifUserNameAvailable!=null){
            return res.status(400).json({"msg": "Username not available, kindly pick a new one"});
        }
        const hashedPassword=await bcrypt.hash(password, 8);
        let createUser= new User({
            name: name,
            email: email,
            password: hashedPassword,
            username: username,
            dob: dob,
            isEmailVerified: isEmailVerified,
            anonymousId:anonymousId
        })
        createUser=await createUser.save();
        const token=jsonwt.encode({id: createUser._id},'token');
        res.status(200).json({token: token, ...createUser._doc});

    }catch(e: any){
        res.status(500).json({"msg": e.message});
    }

})

export {createAccount};