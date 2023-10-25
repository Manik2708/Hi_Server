import {Socket} from 'socket.io';
import { UserOnline } from '../Functions/set_user_online';
import * as EventNames from '../Constants/event_names';
import jwt from 'jwt-simple'
import { User } from '../Database/Models/user';
import { RedisClientType } from '../Tests/Helpers/redis_db_instance';

export const onlineUsers=(socket: Socket, client:RedisClientType)=>{
   try{
    socket.on(EventNames.onlineUsers,async(data: string)=>{
        console.log('event called')
        if(data.trim().length==0){
          socket.emit(EventNames.noToken)  
        }
        else{
        const verify=jwt.decode(data, 'token');
        if(!verify){
            socket.emit(EventNames.invalidToken);
        }
        else{
        const user=await User.findById(verify.id);
        if(user==null){
            socket.emit(EventNames.userNotFound);
        }
        else{
           UserOnline(verify.id, socket,client );
        }
}
        }

        })
   }catch(e: any){
    console.log(e.toString())
   }
}