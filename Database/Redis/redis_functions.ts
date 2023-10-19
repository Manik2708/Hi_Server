import { client } from "../.."
import { RedisNames } from "../../Constants/queues_redis"
import { UnreadRecievedConfessions } from "../../Models/unread_recieved_confessions"


export class RedisFunctions{
    static getUnreadRecievedConfessionById=async(confessionId: string):Promise<UnreadRecievedConfessions|null>=>{
        try{
            const retrievedConfession:string[]=await client.hmGet(RedisNames.RecievedConfessions+confessionId, [
                RedisNames.ConfessionLlsenderId,
                RedisNames.ConfessionLlconfession,
                RedisNames.ConfessionLlsenderAnonymousId,
                RedisNames.ConfessionLltime,
            ])
            const toSendConfession:UnreadRecievedConfessions={
                senderId:retrievedConfession[0],
                id:confessionId,
                confession:retrievedConfession[1],
                senderAnonymousId:retrievedConfession[2],
                time:retrievedConfession[3],
            }
            return toSendConfession;
        }catch(e: any){
         console.log(e.toString());
         return null;
        }
        }
}