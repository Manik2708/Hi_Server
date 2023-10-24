import {createClient} from 'redis';

const client = createClient()
export type RedisClientType = typeof client 
export const createRedisInstance=async():Promise<RedisClientType>=>{
    const client=createClient({
        url:'http://localhost:6300'
    })
    await client.connect()
    return client
}
export const closeRedisServer=async(redis: RedisClientType): Promise<void>=>{
    await redis.flushDb()
    await redis.quit()
}


