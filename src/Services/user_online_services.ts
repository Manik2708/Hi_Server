import { Inject } from '@nestjs/common';
import { RedisClientType } from '../Constants/constant_types';
import { InjectionTokens } from '../Constants/injection_tokens';
import { RedisNames } from '../Constants/queues_redis';

export class UserOnlineServices {
  private client: RedisClientType;
  constructor(@Inject(InjectionTokens.RedisClient) client: RedisClientType) {
    this.client = client;
  }
  ifUserIsOnline = async (userId: string): Promise<boolean> => {
    try {
      return this.client.sIsMember('online-users', userId);
    } catch (e: any) {
      return false;
    }
  };
  userOnline = async (userId: string, socketId: string) => {
    try {
      await this.client.sAdd(RedisNames.OnlineUsers, userId);
      await this.client.hSet(RedisNames.OnlineUserMap + userId, {
        socketId: socketId,
      });
    } catch (e: any) {
      console.log(e.toString());
    }
  };
}
