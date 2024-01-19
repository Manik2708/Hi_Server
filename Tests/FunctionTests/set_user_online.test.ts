import { afterAll, beforeAll, describe, it, expect } from "vitest";
import {
  closeRedisServer,
  createRedisInstance,
} from "../Helpers/redis_db_instance";
import { RedisClientType } from "../..";
import { userOnline } from "../../Functions/set_user_online";
import { nanoid } from "nanoid";
import {
  ServerProperties,
  closeTestServer,
  getTestServerInsatnce,
} from "../Helpers/server_instance";
import { RedisNames } from "../../Constants/queues_redis";
describe("Set user online function test", () => {
  let redisClient: RedisClientType;
  let serverInstance: ServerProperties;
  beforeAll(async () => {
    redisClient = await createRedisInstance();
    serverInstance = await getTestServerInsatnce()!;
  });
  it("Check if user id is set in Redis set and map or not", async () => {
    const userId = nanoid().toLowerCase();
    const socketId = nanoid().toLowerCase();
    userOnline(userId, socketId, redisClient);
    expect(await redisClient.sIsMember("online-users", userId)).toBe(true);
    expect(
      await redisClient.hGet(RedisNames.OnlineUserMap + userId, "socketId"),
    ).toBe(socketId.toString());
  });
  afterAll(async () => {
    closeRedisServer(redisClient!);
    closeTestServer(serverInstance);
  });
});
