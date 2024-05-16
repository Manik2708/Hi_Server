import { Inject } from '@nestjs/common';
import { CreateQueue } from '../../../Queues/base';
import { WebSocketServices } from '../../../Services/websocket_services';
import { InjectionTokens } from '../../../Constants/injection_tokens';
import { QueueNames, RedisNames } from '../../../Constants/queues_redis';
import { MessageHandler } from '../../../Models/message_handler';
import { MessageType } from '../../../Constants/messasge_type';
import { RedisClientType } from '../../../Constants/constant_types';
import { EventNames, GlobalEventNames } from '../../../Constants/event_names';

export class RetrieveDataServices {
  private createQueue: CreateQueue;
  private client: RedisClientType;
  constructor(
    private readonly websocketServices: WebSocketServices,
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
      chnl.consume(QueueNames.OfflineQueue + user_id, (msg) => {
        if (msg == null) {
          return;
        } else {
          const message: MessageHandler = JSON.parse(msg.content.toString());
          const { message_type, ...ommited_message } = message;
          const message_sender: SendMessageToWebsocketServices =
            new SendMessageToWebsocketServices(
              socket_id!,
              ommited_message,
              this.websocketServices,
            );
          switch (message.message_type) {
            case MessageType.CONFESSION_MESSAGE_TYPE:
              message_sender.sendMessage(EventNames.recieveConfession);
              chnl.ack(msg);
              break;
            case MessageType.UPDATE_CONFESSION_STATUS:
              message_sender.sendMessage(EventNames.updateConfssionStatus);
              chnl.ack(msg);
              break;
            case MessageType.ACCEPT_CONFESSION_TYPE:
              message_sender.sendMessage(EventNames.acceptConfession);
              chnl.ack(msg);
              break;
            case MessageType.SEND_CHAT_MESSAGE:
              message_sender.sendMessage(EventNames.recieveChatMessage);
              chnl.ack(msg);
              break;
            case MessageType.UPDATE_STATUS_CHAT_MESSAGES:
              message_sender.sendMessage(
                EventNames.updateStatusOfChatMesssages,
              );
              chnl.ack(msg);
              break;
            case MessageType.DELETE_CHAT_MESSASGE:
              message_sender.sendMessage(EventNames.deleteChatMessage);
              chnl.ack(msg);
              break;
          }
        }
      });
    });
  };
}

class SendMessageToWebsocketServices {
  private socket_id: string;
  private message: any;
  private websocketService: WebSocketServices;

  constructor(
    socket_id: string,
    message: any,
    websocketService: WebSocketServices,
  ) {
    this.socket_id = socket_id;
    this.message = message;
    this.websocketService = websocketService;
  }

  sendMessage = (name: string) => {
    this.websocketService.addEvent({
      id: this.socket_id,
      name: GlobalEventNames.offline + name,
      data: this.message,
    });
  };
}
