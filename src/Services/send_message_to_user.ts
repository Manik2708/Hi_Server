import { QueueNames, RedisNames } from '../Constants/queues_redis';
import { MessageHandler } from '../Models/message_handler';
import { RedisClientType } from '../Constants/constant_types';
import amqp from 'amqplib/callback_api';
import { CreateQueue } from '../Queues/base';
import { InjectionTokens } from '../Constants/injection_tokens';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { WebSocketServices } from './websocket_services';
// import { UserOnlineServices } from './user_online_services';
@Injectable({ scope: Scope.DEFAULT })
export class SendMessageToUserService {
  private webSocketServices: WebSocketServices;
  private createQueue: CreateQueue;
  private client: RedisClientType;
  // private userOnlineServices: UserOnlineServices;
  constructor(
    webSocketServices: WebSocketServices,
    @Inject(InjectionTokens.CreateQueue) createQueue: CreateQueue,
    @Inject(InjectionTokens.RedisClient) client: RedisClientType,
    // @Inject() userOnlineServices: UserOnlineServices
  ) {
    this.client = client;
    this.createQueue = createQueue;
    this.webSocketServices = webSocketServices;
    // this.userOnlineServices = userOnlineServices;
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
      // const userIsOnline = await this.userOnlineServices.ifUserIsOnline(userId);
      let bool = true;
      if (bool) {
        const socketid = await this.client.hGet(
          RedisNames.OnlineUserMap + userId,
          RedisNames.SocketId,
        );
        this.webSocketServices.addEvent({
          id: socketid!,
          name: userIsOnlineEvent,
          data: messageForOnlineUser,
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
