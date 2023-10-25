import { Socket } from 'socket.io';
import { RedisNames } from '../Constants/queues_redis';
import { RedisClientType } from '../Tests/Helpers/redis_db_instance';
export const UserOnline=async(userId: string, socket: Socket, client:RedisClientType)=>{
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