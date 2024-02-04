// import { RedisNames } from "../Constants/queues_redis";
// import { tokenLost } from "../Constants/event_names";
// import { RedisClientType } from "../Tests/Helpers/redis_db_instance";
// export const getFirebaseToken=async(CrushId: string, client:RedisClientType): Promise<string>=>{
//     try{
//         var firebaseToken=await client.hGet(RedisNames.OnlineUserMap+CrushId,RedisNames.FirebaseToken);
//     if(firebaseToken==null){
//         socketfotApis.emit(tokenLost)
//         firebaseToken=await client.hGet(RedisNames.OnlineUserMap+CrushId,RedisNames.FirebaseToken);
//     }
//     return firebaseToken!;
//     }
//     catch(e: any){
//         console.log(e.toString())
//         return 'false'
//     }
// }

// export const setFirebaseToken=async(client:RedisClientType, userId:string, token:string):Promise<void>=>{
//     await client.hSet('OnlineUserMap'+userId, {
//         firebasetoken: token.toString(),
//     })
// }
