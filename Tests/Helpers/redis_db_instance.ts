import { createClient } from "redis";
import { RedisClientType } from "../..";
export const createRedisInstance =
  async (): Promise<RedisClientType | null> => {
    try {
      const testingClient = createClient({
        url: "redis://localhost:6392",
      });
      await testingClient.connect();
      console.log("Redis running");
      return testingClient;
    } catch (e: any) {
      console.log("Error in redis server" + e.toString());
      return null;
    }
  };
export const closeRedisServer = async (
  redis: RedisClientType,
): Promise<void> => {
  await redis.flushDb();
  await redis.quit();
};
