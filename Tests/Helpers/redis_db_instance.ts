import { createClient } from "redis";
import { RedisClientType } from "../..";
export const createRedisInstance = async () => {
  return new Promise<RedisClientType>(async (resolve, reject) => {
    const testingClient = createClient({
      url: "redis://0.0.0.0:6392",
    });
    await testingClient.connect();
    resolve(testingClient);
    setTimeout(() => {
      reject(new Error("Failed to connect with Redis in 5 seconds."));
    }, 5000);
  });
};
export const closeRedisServer = async (
  redis: RedisClientType,
): Promise<void> => {
  await redis.flushDb();
  await redis.quit();
};
