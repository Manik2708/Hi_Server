import { client } from "..";
import { RedisNames } from "../Constants/queues_redis";
import { socketfotApis } from "../Websockets/base";
import { tokenLost } from "../Constants/event_names";
export const getFirebaseToken=async(CrushId: string): Promise<string>=>{
    try{
        var firebaseToken=await client.hGet(RedisNames.OnlineUserMap+CrushId,RedisNames.FirebaseToken);
    if(firebaseToken==null){
        socketfotApis.emit(tokenLost)
        firebaseToken=await client.hGet(RedisNames.OnlineUserMap+CrushId,RedisNames.FirebaseToken);
    }
    return firebaseToken!;
    }
    catch(e: any){
        console.log(e.toString())
        return 'false'
    }
}