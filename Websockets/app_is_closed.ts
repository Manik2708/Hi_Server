import { Socket } from "socket.io";
import {client} from '..';
import * as EventNames from '../Constants/event_names';
import { RedisNames } from "../Constants/queues_redis";
export const appIsClosed=(socket: Socket)=>{
   try{
    socket.on(EventNames.appIsClosed, (data)=>{
        client.sRem(RedisNames.OnlineUsers, data.id);
       })
   }catch(e: any){
    console.log(e.toString());
   }
}