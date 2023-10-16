import { Socket } from "socket.io";
import { client } from "..";
import { RedisNames } from "../Constants/queues_redis";

export const markConfessionAsRead=(socket: Socket)=>{
    socket.on('mark-confession-read', async(data)=>{
        const previousConfessionId=await client.hGet(RedisNames.RecievedConfessions+data.id, RedisNames.ConfessionLlpreviousConfessionId);
        const nextConfessionId=await client.hGet(RedisNames.RecievedConfessions+data.id, RedisNames.ConfessionLlnextConfessionId);
        if(previousConfessionId!=undefined&&nextConfessionId!=undefined){
            await client.hSet(RedisNames.RecievedConfessions+previousConfessionId,{
                nextConfessionId:nextConfessionId
            }
            )
            await client.hSet(RedisNames.RecievedConfessions+nextConfessionId, {
                previousConfessionId:previousConfessionId
            })
            await client.hDel(RedisNames.RecievedConfessions+data.id, [
                RedisNames.ConfessionLlsenderId,
                RedisNames.ConfessionLlconfession,
                RedisNames.ConfessionLlnextConfessionId,
                RedisNames.ConfessionLlsenderAnonymousId,
                RedisNames.ConfessionLlpreviousConfessionId,
                RedisNames.ConfessionLltime
            ] )
        }
    })
}