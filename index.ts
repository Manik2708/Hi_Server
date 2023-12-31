import express from 'express';
import mongoose from 'mongoose';
import {createAccount} from './APIs/create_account';
import { tokenValidator } from './APIs/token_validation';
import { getData } from './APIs/provide_data';
import { verifyOTP } from './APIs/verify_otp';
import { sendOTP } from './APIs/send_otp';
import { login } from './APIs/login';
import { changeEmail } from './APIs/change_email';
import { changePassword } from './APIs/change_password';
import {Server} from 'socket.io';
import http from 'http';
import { connectToSocket } from './Websockets/base';
import { createClient } from 'redis';
import { sendConfession } from './APIs/send_confession';
import { saveFirebaseToken } from './APIs/firebase_token';
import admin from 'firebase-admin';
import { requestUnreadRecievedConfessions } from './APIs/request_recieved_confessions';
import { rejectConfession } from './APIs/reject_confession';
import { DatabaseUrl, FirebasePath, IP, IfRunningOnDocker } from './enviornment_variables';
import { createChannel } from './Queues/base';
import { RedisClientType } from './Tests/Helpers/redis_db_instance';
import { searchUser } from './Constants/event_names';
const conf=require(FirebasePath);
const Db=DatabaseUrl;

const app=express();
app.use(express.json());
app.use(createAccount);
app.use(tokenValidator);
app.use(getData);
app.use(verifyOTP);
app.use(sendOTP);
app.use(login);
app.use(changeEmail);
app.use(changePassword);
app.use(sendConfession);
app.use(saveFirebaseToken);
app.use(requestUnreadRecievedConfessions)
app.use(rejectConfession)
app.use(searchUser)

const server=http.createServer(app);
mongoose.connect(Db).then(()=>{console.log('Connected to Database')}).catch((e)=>console.log(e.message));

server.listen(3000,IP,()=>{
    console.log('Connected!');
})
let client:RedisClientType;
if(IfRunningOnDocker=='true'){
    client =createClient({
        url:'redis://client:6379'
    });
}
else{
    client =createClient({}); 
}
const connect=async()=>{
    await client.connect();
}
const ioServer=new Server(server);
client.on('error', err => console.log('Redis Client Error', err));
connect();
connectToSocket();
admin.initializeApp({
    credential: admin.credential.cert(conf)
});

try{
    createChannel((chnl)=>{})
}
catch(e:any){
    console.log(e.toString())
}
export {ioServer,client };
