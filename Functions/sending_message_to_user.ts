import { QueueNames, RedisNames } from "../Constants/queues_redis";
import { MessageHandler } from "../Models/message_handler";
import { ifUserIsOnline } from "./if_user_online";
import { RedisClientType } from "..";
import amqp from "amqplib/callback_api";
import { Server } from "socket.io";
import { CreateQueue } from "../Queues/base";
/**
 * @param userId : Sender id of the user to which message is to be sent
 * @param wantTosendNotification : A boolean whether notification is to be sent to the user or not
 * @param userIsOnlineEvent : Name of socket event which will be triggered when user is online
 * @param messageForOnlineUser : Message for the user when it is online
 * @param commonMessage : A common message which will be sent to Offline queue if user is offline
 * @param io : Dependency injection of socket server
 * @param client : Dependency injection of Redis client
 * @param sendNotificationFunction : If notification is to be sent, then the notification function
 * @param createQueue : Dependency injection of Create queue object which will send message to queue if user is offline
 * @param afterAcknowledgement : An optional parameter, for the execution of a task when message is acknowledged from sockets
 */
export const sendMessageToUser = async (
  userId: string,
  wantTosendNotification: boolean,
  userIsOnlineEvent: string,
  messageForOnlineUser: any,
  commonMessage: MessageHandler,
  io: Server,
  client: RedisClientType,
  sendNotificationFunction: () => void,
  createQueue: CreateQueue,
  afterAcknowledgement?: () => void,
): Promise<void> => {
  try {
    const userIsOnline = await ifUserIsOnline(userId, client);
    if (userIsOnline) {
      const socketid = await client.hGet(
        RedisNames.OnlineUserMap + userId,
        RedisNames.SocketId,
      );
      // An acknowledgement is required from client that message is delievered, only if it is delievered then message is saved to DB
      // TODO: If no ack is there then we have to think of saving this same confession somewhere else!
      io.to(socketid!).emit(
        userIsOnlineEvent,
        messageForOnlineUser,
        (ack: string) => {
          if (afterAcknowledgement) {
            afterAcknowledgement();
          }
        },
      );
    } else {
      if (afterAcknowledgement) {
        afterAcknowledgement();
      }
      createQueue.createChannel(
        (sendingChannelForOfflineUser: amqp.Channel) => {
          sendingChannelForOfflineUser.assertQueue(
            QueueNames.OfflineQueue + userId,
            { durable: true },
          );
          sendingChannelForOfflineUser.sendToQueue(
            QueueNames.OfflineQueue + userId,
            Buffer.from(JSON.stringify(commonMessage)),
          );
        },
      );
      if (wantTosendNotification) {
        sendNotificationFunction();
      }
    }
  } catch (e: any) {
    console.log(e.toString());
  }
};
