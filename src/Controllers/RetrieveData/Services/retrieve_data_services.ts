import { Inject } from '@nestjs/common';
import { CreateQueue } from '../../../Queues/base';
import { InjectionTokens } from '../../../Constants/injection_tokens';
import { QueueNames, RedisNames } from '../../../Constants/queues_redis';
import { MessageHandler } from '../../../Models/message_handler';
import { MessageType } from '../../../Constants/messasge_type';
import { RedisClientType } from '../../../Constants/constant_types';
import { EventNames } from '../../../Constants/event_names';

export class RetrieveDataServices {
  private createQueue: CreateQueue;
  private client: RedisClientType;
  constructor(
    @Inject(InjectionTokens.CreateQueue) createQueue: CreateQueue,
    @Inject(InjectionTokens.RedisClient) client: RedisClientType,
  ) {
    this.client = client;
    this.createQueue = createQueue;
  }

  retrieveDataForOfflineUsers = async (user_id: string) => {
    const socket_id = await this.client.hGet(
      RedisNames.OnlineUserMap + user_id,
      RedisNames.SocketId,
    );
    this.createQueue.createChannel((chnl) => {
      chnl.assertQueue(QueueNames.OfflineQueue + user_id, { durable: true });
      chnl.consume(QueueNames.OfflineQueue + user_id, async (msg) => {
        if (msg == null) {
          return;
        } else {
          const message: MessageHandler = JSON.parse(msg.content.toString());
          const { message_type, ...ommited_message } = message;
          const message_sender: SendMessageToWebsocketServices =
            new SendMessageToWebsocketServices(
              socket_id!,
              ommited_message,
              user_id,
              this.client,
            );
          switch (message.message_type) {
            case MessageType.CONFESSION_MESSAGE_TYPE:
              await message_sender.sendMessage(EventNames.recieveConfession);
              chnl.ack(msg);
              break;
            case MessageType.UPDATE_CONFESSION_STATUS:
              await message_sender.sendMessage(
                EventNames.updateConfssionStatus,
              );
              chnl.ack(msg);
              break;
            case MessageType.ACCEPT_CONFESSION_TYPE:
              await message_sender.sendMessage(EventNames.acceptConfession);
              chnl.ack(msg);
              break;
            case MessageType.SEND_CHAT_MESSAGE:
              await message_sender.sendMessage(EventNames.recieveChatMessage);
              chnl.ack(msg);
              break;
            case MessageType.UPDATE_STATUS_CHAT_MESSAGES:
              await message_sender.sendMessage(
                EventNames.updateStatusOfChatMesssages,
              );
              chnl.ack(msg);
              break;
            case MessageType.DELETE_CHAT_MESSASGE:
              await message_sender.sendMessage(EventNames.deleteChatMessage);
              chnl.ack(msg);
              break;
          }
        }
      });
    });
  };
}

class SendMessageToWebsocketServices {
  private redis: RedisClientType;
  private socket_id: string;
  private message: any;
  private user_id: string;

  constructor(
    socket_id: string,
    message: any,
    user_id: string,
    redis: RedisClientType,
  ) {
    this.socket_id = socket_id;
    this.message = message;
    this.redis = redis;
    this.user_id = user_id;
  }

  sendMessage = async (name: string) => {
    await this.redis.PUBLISH(
      this.user_id,
      JSON.stringify({
        id: this.socket_id,
        name: name,
        data: this.message,
      }),
    );
  };
}
