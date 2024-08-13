import { Inject } from '@nestjs/common';
import { RedisClientType } from '../Constants/constant_types';
import { InjectionTokens } from '../../package/constants/src/injection_tokens';
import { RedisNames } from '../../package/constants/src/queues_redis';
import { InternalServerError } from '../../package/errors/src/server_error';

export class UserOnlineServices {
  private client: RedisClientType;
  constructor(@Inject(InjectionTokens.RedisClient) client: RedisClientType) {
    this.client = client;
  }
  ifUserIsOnline = async (userId: string): Promise<boolean> => {
    try {
      return this.client.sIsMember(RedisNames.OnlineUsers, userId);
    } catch (e: any) {
      throw new InternalServerError(e.toString());
    }
  };
  userOnline = async (userId: string, socketId: string) => {
    try {
      await this.client.sAdd(RedisNames.OnlineUsers, userId);
      await this.client.hSet(RedisNames.OnlineUserMap + userId, {
        socketId: socketId,
      });
    } catch (e: any) {
      throw new InternalServerError(e.toString());
    }
  };
}
