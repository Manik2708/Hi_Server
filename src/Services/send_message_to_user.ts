import { QueueNames, RedisNames } from '../Constants/queues_redis';
import { MessageHandler } from '../Models/message_handler';
import { RedisClientType } from '../Constants/constant_types';
import amqp from 'amqplib/callback_api';
import { CreateQueue } from '../Queues/base';
import { InjectionTokens } from '../Constants/injection_tokens';
import { Inject, Injectable, Scope, forwardRef } from '@nestjs/common';
import { UserOnlineServices } from './user_online_services';
import { InternalServerError } from '../Errors/server_error';
import { WebSocketMessageError } from '../Errors/websocket_message_not_sent_error';
import { GRPCServices } from './grpc';
@Injectable({ scope: Scope.DEFAULT })
export class SendMessageToUserService {
  private grpcAddress: string;
  private client: RedisClientType;
  private userOnlineServices: UserOnlineServices;
  constructor(
    @Inject(InjectionTokens.GRPClientAddress) grpcAddress: string,
    @Inject(InjectionTokens.RedisClient) client: RedisClientType,
    @Inject(forwardRef(() => UserOnlineServices))
    userOnlineServices: UserOnlineServices,
  ) {
    this.client = client;
    this.grpcAddress = grpcAddress;
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
        await this.client.PUBLISH(
          userId,
          JSON.stringify({
            id: socketid!,
            name: userIsOnlineEvent,
            data: messageForOnlineUser,
          }),
        );
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
        await this.sendMessageToOfflineUser(
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
      const grpcService = new GRPCServices(this.grpcAddress)
      grpcService.saveMessageForOfflineUser(userId, commonMessage)
      if (wantTosendNotification) {
        sendNotificationFunction();
      }
    } catch (e: any) {
      throw new InternalServerError(e.toString());
    }
  };
}
