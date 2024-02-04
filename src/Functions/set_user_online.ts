import { RedisNames } from '../Constants/queues_redis';
import { RedisClientType } from '..';
export const userOnline = async (
  userId: string,
  socketId: string,
  client: RedisClientType,
) => {
  try {
    await client.sAdd(RedisNames.OnlineUsers, userId);
    await client.hSet(RedisNames.OnlineUserMap + userId, {
      socketId: socketId,
    });
  } catch (e: any) {
    console.log(e.toString());
  }
};
