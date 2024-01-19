import { afterAll, beforeAll, describe, it, expect } from "vitest";
import { RedisClientType } from "../..";
import { createRedisInstance } from "../Helpers/redis_db_instance";
import { sendMessageToUser } from "../../Functions/sending_message_to_user";
import { QueueNames, RedisNames } from "../../Constants/queues_redis";
import { nanoid } from "nanoid";
import { Socket as ClientSocket } from "socket.io-client";
import { ServerProperties } from "../Helpers/server_instance";
import { getTestServerInsatnce } from "../Helpers/server_instance";
import {
  initClientSocket,
  initServerSocket,
} from "../Helpers/socket_io_testing_env";
import { Server as IoServer } from "socket.io";
import { CreateQueue } from "../../Queues/base";
describe("sending_message_to_user function test", async () => {
  let redisClient: RedisClientType;
  let serverInstance: ServerProperties;
  let clientSocket: ClientSocket;
  let socketServer: IoServer;
  var eventTriggered: boolean = false;
  var output: {};
  let createTestQueue: CreateQueue;
  beforeAll(async () => {
    redisClient = await createRedisInstance();
    serverInstance = await getTestServerInsatnce();
    socketServer = initServerSocket(serverInstance.server);
    clientSocket = await initClientSocket((socket) => {
      socket.on("online-event", (data) => {
        output = data;
        eventTriggered = true;
      });
    });
    createTestQueue = new CreateQueue(true);
  });
  afterAll(() => {
    socketServer.close();
    clientSocket.disconnect();
  });
  it("When user is online", async () => {
    const userId = nanoid().toLowerCase();
    await redisClient.sAdd(RedisNames.OnlineUsers, userId);
    await redisClient.hSet(RedisNames.OnlineUserMap + userId, {
      socketId: clientSocket.id,
    });
    await sendMessageToUser(
      userId,
      false,
      "online-event",
      { msg: "hello" },
      {
        messageType: 1,
      },
      socketServer,
      redisClient!,
      () => {},
      createTestQueue,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(eventTriggered).toBe(true);
    expect(output).toStrictEqual({ msg: "hello" });
  });
  it("When user is offline", async () => {
    const userId = nanoid().toLowerCase();
    await sendMessageToUser(
      userId,
      false,
      "online-event",
      { msg: "hello" },
      {
        messageType: 1,
      },
      socketServer,
      redisClient!,
      () => {},
      createTestQueue,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    let output: Buffer = Buffer.from("");
    createTestQueue.createChannel((chnl) => {
      chnl.assertQueue(QueueNames.OfflineQueue + userId);
      chnl.consume(QueueNames.OfflineQueue + userId, (msg) => {
        output = msg?.content!;
      });
    });
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(JSON.parse(output.toString())).toStrictEqual({ messageType: 1 });
  });
});
