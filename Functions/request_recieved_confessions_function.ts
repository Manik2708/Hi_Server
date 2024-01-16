import { UnreadRecievedConfessions } from "../Models/unread_recieved_confessions";
import { RedisNames } from "../Constants/queues_redis";
import { RedisFunctions } from "../Database/Redis/redis_functions";
import { RedisClientType } from "../Tests/Helpers/redis_db_instance";

export const requestUnreadRecievedConfessionsFxn = async (
  client: RedisClientType,
  lastConfessionId: string,
  userId: string,
): Promise<Array<UnreadRecievedConfessions>> => {
  const list: Array<UnreadRecievedConfessions> = [];
  const tryRetrivingFromRedis = await client.get(
    RedisNames.LastRecievedConfession + userId,
  );
  if (lastConfessionId == "first-page") {
    if (tryRetrivingFromRedis == null) {
      return list;
    } else {
      lastConfessionId = tryRetrivingFromRedis;
    }
  }
  for (var i = 0; i < 30; i++) {
    const getNextConfessionId: string | undefined = await client.hGet(
      RedisNames.RecievedConfessions + lastConfessionId,
      RedisNames.ConfessionLlnextConfessionId,
    );

    if (getNextConfessionId == null || getNextConfessionId == undefined) {
      break;
    } else {
      lastConfessionId = getNextConfessionId;
    }
    const confessionToSend =
      await RedisFunctions.getUnreadRecievedConfessionById(lastConfessionId);
    if (confessionToSend != null) {
      list.push(confessionToSend);
    }
  }
  return list;
};
