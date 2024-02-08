import { QueueNames, RedisNames } from '../Constants/queues_redis';
import { MessageHandler } from '../Models/message_handler';
import { ifUserIsOnline } from '../Functions/if_user_online';
import { RedisClientType } from '../main';
import amqp from 'amqplib/callback_api';
import { CreateQueue } from '../Queues/base';
import { InjectionTokens } from '../Constants/injection_tokens';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { WebSocketServices } from './websocket_services';
@Injectable({ scope: Scope.DEFAULT })
export class SendMessageToUserService {
  private client: RedisClientType;
  private webSocketServices: WebSocketServices
  private createQueue: CreateQueue;
  constructor(
    @Inject(InjectionTokens.RedisClient) client: RedisClientType,
    @Inject(InjectionTokens.CreateQueue) createQueue: CreateQueue,
  ) {
    this.client = client;
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
        this.webSocketServices.addEvent({
          id: socketid!,
          name: userIsOnlineEvent,
          data: messageForOnlineUser
        })
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
