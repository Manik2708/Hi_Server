import { afterAll, beforeAll, describe, it, expect } from "vitest";
import {
  closeRedisServer,
  createRedisInstance,
} from "../Helpers/redis_db_instance";
import { nanoid } from "nanoid";
import { RedisClientType } from "../..";
import { ifUserIsOnline } from "../../Functions/if_user_online";
import { RedisNames } from "../../Constants/queues_redis";
describe("if_user_online function tests", async () => {
  let redisClient: RedisClientType;
  beforeAll(async () => {
    redisClient = await createRedisInstance();
  });
  it("When user is offline", async () => {
    const userId = nanoid().toLowerCase();
    const ifUserOnline: boolean = await ifUserIsOnline(userId, redisClient!);
    expect(ifUserOnline).toBe(false);
  });
  it("When user is online", async () => {
    const userId = nanoid().toLowerCase();
    await redisClient.sAdd(RedisNames.OnlineUsers, userId);
    const ifUserOnline: boolean = await ifUserIsOnline(userId, redisClient!);
    expect(ifUserOnline).toBe(true);
  });
  afterAll(async () => {
    closeRedisServer(redisClient!);
  });
});
