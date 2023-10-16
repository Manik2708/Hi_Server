import {client} from '..';
import { Socket } from 'socket.io';
import { RedisNames } from '../Constants/queues_redis';
export const UserOnline=async(userId: string, socket: Socket)=>{
try{
    await client.sAdd(RedisNames.OnlineUsers, userId);
    await client.hSet(RedisNames.OnlineUserMap+userId, {
        socketId: socket.id.toString(),
    })
}
catch(e: any){
    console.log(e.toString());
}
}