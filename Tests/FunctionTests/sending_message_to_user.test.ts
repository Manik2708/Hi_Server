import { afterAll, beforeAll, describe, it, expect } from "vitest";
import { RedisClientType } from "../..";
import { createRedisInstance } from "../Helpers/redis_db_instance";
import {
  ServerProperties,
  getTestServerInsatnce,
} from "../Helpers/server_instance";
import { envForTestingSocket } from "../Helpers/socket_io_testing_env";
import express from "express";
import { sendMessageToUser } from "../../Functions/sending_message_to_user";
import { RedisNames } from "../../Constants/queues_redis";
import { nanoid } from "nanoid";
import { createTestingChannel } from "../Helpers/rabbitmq_testing_channel";
import request from "supertest";
describe("sending_message_to_user function test", async () => {
  let redisClient: RedisClientType | null;
  let serverInstance: ServerProperties;
  beforeAll(async () => {
    redisClient = await createRedisInstance();
    serverInstance = getTestServerInsatnce()!;
  });
  it("When user is online", async () => {
    var eventTriggered: boolean = false;
    envForTestingSocket(
      serverInstance.server,
      async (serverSocket, clientSocket) => {
        const userId = nanoid().toLowerCase();
        clientSocket.on("online-event", () => {
          eventTriggered = true;
        });
        await redisClient!.sAdd(RedisNames.OnlineUsers, userId);
        await redisClient!.hSet(RedisNames.OnlineUserMap + userId, {
          socketId: clientSocket.id,
        });
        const mockApi = express.Router();
        mockApi.get("/mockapi", (req, res) => {
          sendMessageToUser(
            userId,
            false,
            "online-event",
            { msg: "hello" },
            {
              messageType: 1,
            },
            req,
            redisClient!,
            () => {},
            createTestingChannel,
          );
          return res.status(400);
        });
        serverInstance.app.use(mockApi);
        await request(serverInstance.app).post("/mockapi").send().expect(400);
        expect(eventTriggered).toBe(true);
      },
    );
  });
  it("When user is offline", async () => {});
});
