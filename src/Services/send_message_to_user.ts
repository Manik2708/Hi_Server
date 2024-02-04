import { QueueNames, RedisNames } from '../Constants/queues_redis';
import { MessageHandler } from '../Models/message_handler';
import { ifUserIsOnline } from '../Functions/if_user_online';
import { RedisClientType } from '..';
import amqp from 'amqplib/callback_api';
import { Server } from 'socket.io';
import { CreateQueue } from '../Queues/base';
import { InjectionTokens } from '../Constants/injection_tokens';
import { Inject, Injectable, Scope } from '@nestjs/common';
@Injectable({ scope: Scope.DEFAULT })
export class SendMessageToUserService {
  private client: RedisClientType;
  private io: Server;
  private createQueue: CreateQueue;
  constructor(
    @Inject(InjectionTokens.RedisClient) client: RedisClientType,
    @Inject(InjectionTokens.IoServer) io: Server,
    @Inject(InjectionTokens.CreateQueue) createQueue: CreateQueue,
  ) {
    this.client = client;
    this.io = io;
    this.createQueue = createQueue;
  }

  sendMessageToUser = async (
    userId: string,
    wantTosendNotification: boolean,
    userIsOnlineEvent: string,
    messageForOnlineUser: any,
    commonMessage: MessageHandler,
    sendNotificationFunction: () => void,
    afterAcknowledgement?: () => void,
  ): Promise<void> => {
    try {
      const userIsOnline = await ifUserIsOnline(userId, this.client);
      if (userIsOnline) {
        const socketid = await this.client.hGet(
          RedisNames.OnlineUserMap + userId,
          RedisNames.SocketId,
        );
        // An acknowledgement is required from client that message is delievered, only if it is delievered then message is saved to DB
        // TODO: If no ack is there then we have to think of saving this same confession somewhere else!
        this.io
          .to(socketid!)
          .emit(userIsOnlineEvent, messageForOnlineUser, (ack: string) => {
            if (afterAcknowledgement) {
              afterAcknowledgement();
            }
          });
      } else {
        if (afterAcknowledgement) {
          afterAcknowledgement();
        }
        this.createQueue.createChannel(
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
}
