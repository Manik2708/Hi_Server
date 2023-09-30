import {client} from '..';
import { Socket } from 'socket.io';
export const UserOnline=async(userId: string, socket: Socket)=>{
try{
    await client.sAdd('online-users', userId);
    await client.hSet('OnlineUserMap'+userId, {
        socketId: socket.id.toString(),
    })
}
catch(e: any){
    console.log(e.toString());
}
}