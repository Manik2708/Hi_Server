import { RedisClientType } from '../main';

export const ifUserIsOnline = async (
  userId: string,
  client: RedisClientType,
): Promise<boolean> => {
  try {
    return client.sIsMember('online-users', userId);
  } catch (e: any) {
    return false;
  }
};
