import { RedisClientType } from "../Tests/Helpers/redis_db_instance";


export const ifUserIsOnline=async(userId: string, client:RedisClientType): Promise<boolean>=>{
   try{
    return client.sIsMember('online-users', userId);
   }
   catch(e: any){
    console.log(e.toString()+ 'here in if online users');
    return false;
   }
}