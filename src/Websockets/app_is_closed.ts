import { Socket } from 'socket.io';
import * as EventNames from '../Constants/event_names';
import { RedisNames } from '../Constants/queues_redis';
import { RedisClientType } from '../index';
export const appIsClosed = (socket: Socket, client: RedisClientType) => {
  try {
    socket.on(EventNames.appIsClosed, (data) => {
      client.sRem(RedisNames.OnlineUsers, data.id);
    });
  } catch (e: any) {
    console.log(e.toString());
  }
};
