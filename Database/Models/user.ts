import mongoose, {Schema, model} from 'mongoose';
import { confessionSchema } from './confession';
import { UserModel } from '../../Models/user';
const userSchema=new Schema<UserModel>({
    name:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    dob:{
        type: Date,
        required: true
    },
    isEmailVerified:{
        type: Boolean,
        required: true
    },
    anonymousId:{
        type: String,
        required: true
    },
    sentConfessions:[
        {
            confessions: confessionSchema
        },
    ],
    recievedConfessions:[
        {
            confessions: confessionSchema
        },
    ]
});
const User=model('User', userSchema);
export {User};