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
import { envForTestingSocket } from "../Helpers/socket_io_testing_env";
describe("Set user online function test", () => {
  let redisClient: RedisClientType | null;
  let serverInstance: ServerProperties;
  beforeAll(async () => {
    redisClient = await createRedisInstance();
    serverInstance = getTestServerInsatnce()!;
  });
  it("Check if user id is set in Redis set and map or not", async () => {
    const userId = nanoid().toLowerCase();
    envForTestingSocket(serverInstance.server, (serverSocket, clientSocket) => {
      userOnline(userId, serverSocket.id, redisClient!);
      expect(redisClient?.sIsMember("online-users", userId)).toBe(true);
      expect(
        redisClient?.hGet(RedisNames.OnlineUserMap + userId, "socketId"),
      ).toBe(serverSocket.id.toString());
    });
  });
  afterAll(async () => {
    closeRedisServer(redisClient!);
    closeTestServer(serverInstance);
  });
});
