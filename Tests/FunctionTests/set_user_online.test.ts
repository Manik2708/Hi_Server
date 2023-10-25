import { afterAll, beforeAll, describe, it, expect} from "vitest";
import { RedisClientType, closeRedisServer, createRedisInstance } from "../Helpers/redis_db_instance";
import { UserOnline } from "../../Functions/set_user_online";
import { nanoid } from "nanoid";
import * as SocketClient from 'socket.io-client'
import { createTestingSocketClient } from "../Helpers/testing_socket_client";
import { ServerProperties, closeTestServer, getTestServerInsatnce } from "../Helpers/server_instance";
import { closeSocketServer, createTestingSocketServer, socketForTesting } from "../Helpers/socket.io_instance";
import * as EventNames from '../../Constants/event_names';
import { RedisNames } from "../../Constants/queues_redis";
import { Server } from "socket.io";
describe('Set user online function test', ()=>{
    let redisClient:RedisClientType|null
    let socketServerInstance:Server
    let socketClientInstance:SocketClient.Socket
    let serverInstance: ServerProperties
    beforeAll(async()=>{
        redisClient=await createRedisInstance()
        serverInstance=getTestServerInsatnce()!
        socketServerInstance=createTestingSocketServer(serverInstance.server)!
        socketClientInstance=createTestingSocketClient()!
    })
    afterAll(async()=>{
        closeRedisServer(redisClient!)
        closeSocketServer(socketServerInstance)
        closeTestServer(serverInstance)
    })
    it('Check if user id is set in Redis set and map or not', async()=>{
        let socketId:string=''
        socketForTesting!.on(EventNames.onlineUsers, (data)=>{
            UserOnline(data.id, socketForTesting!, redisClient!)
            socketId=socketForTesting!.id
        })
        const id=nanoid().toLowerCase()
        socketClientInstance.emit(EventNames.onlineUsers, {
            id:id
        })
        const check=await redisClient!.sIsMember(RedisNames.OnlineUsers, id)
        const checkagain=await redisClient!.hGet(RedisNames.OnlineUserMap, RedisNames.SocketId)
        expect(check).toBe(true)
        expect(checkagain).toBe(socketId)
    })
})