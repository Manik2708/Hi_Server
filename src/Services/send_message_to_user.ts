import { QueueNames, RedisNames } from '../../package/constants/src/queues_redis';
import { MessageHandler } from '../../package/database/src/Models/message_handler';
import { RedisClientType } from '../Constants/constant_types';
import amqp from 'amqplib/callback_api';
import { CreateQueue } from '../Queues/base';
import { InjectionTokens } from '../../package/constants/src/injection_tokens';
import { Inject, Injectable, Scope, forwardRef } from '@nestjs/common';
import { UserOnlineServices } from './user_online_services';
import { InternalServerError } from '../../package/errors/src/server_error';
import { WebSocketMessageError } from '../../package/errors/src/websocket_message_not_sent_error';
@Injectable({ scope: Scope.DEFAULT })
export class SendMessageToUserService {
  private createQueue: CreateQueue;
  private client: RedisClientType;
  private userOnlineServices: UserOnlineServices;
  constructor(
    @Inject(InjectionTokens.CreateQueue) createQueue: CreateQueue,
    @Inject(InjectionTokens.RedisClient) client: RedisClientType,
    @Inject(forwardRef(() => UserOnlineServices))
    userOnlineServices: UserOnlineServices,
  ) {
    this.client = client;
    this.createQueue = createQueue;
    this.userOnlineServices = userOnlineServices;
  }

  sendMessageToUser = async (
    userId: string,
    wantTosendNotification: boolean,
    userIsOnlineEvent: string,
    messageForOnlineUser: any,
    commonMessage: MessageHandler,
    sendNotificationFunction: () => void,
    afterAcknowledgement?: () => Promise<void>,
  ): Promise<void> => {
    try {
      const userIsOnline = await this.userOnlineServices.ifUserIsOnline(userId);
      if (userIsOnline) {
        const socketid = await this.client.hGet(
          RedisNames.OnlineUserMap + userId,
          RedisNames.SocketId,
        );
        await this.client.PUBLISH(userId, JSON.stringify({
          id: socketid!,
          name: userIsOnlineEvent,
          data: messageForOnlineUser,
        }))
        if (afterAcknowledgement) {
          await afterAcknowledgement();
        }
      } else {
        await this.sendMessageToOfflineUser(
          userId,
          commonMessage,
          sendNotificationFunction,
          wantTosendNotification,
          afterAcknowledgement,
        );
      }
    } catch (e: any) {
      if (e instanceof WebSocketMessageError) {
        this.sendMessageToOfflineUser(
          userId,
          commonMessage,
          sendNotificationFunction,
          wantTosendNotification,
          afterAcknowledgement,
        );
      }
      throw new InternalServerError(e.toString());
    }
  };
  private sendMessageToOfflineUser = async (
    userId: string,
    commonMessage: MessageHandler,
    sendNotificationFunction: () => void,
    wantTosendNotification: boolean,
    afterAcknowledgement?: () => void,
  ): Promise<void> => {
    try {
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
    } catch (e: any) {
      throw new InternalServerError(e.toString());
    }
  };
}
