import { ChatMessageModel } from '../../../../package/database/src/Models/chat_message_model';
import { CassandraDatabaseQueries } from '../../../Database/Cassandra/queries';
import { SendMessageToUserService } from '../../../Services/send_message_to_user';
import { EventNames } from '../../../../package/constants/src/event_names';
import {
  convertChatMessageToCommonMessage,
  convertDeleteMessasgeToCommonMessage,
  convertUpdateStatusOfChatMessagesToCommonMessage,
} from '../../../../package/database/src/Models/message_handler';
import { types } from 'cassandra-driver';
import {
  DeleteMessageModel,
  UpdateStatusOfChatMessageModel,
} from '../../../../package/database/src/Models/update_status_of_chat_message';
import { CreateQueue } from '../../../Queues/base';
import { Inject } from '@nestjs/common';
import { InjectionTokens } from '../../../../package/constants/src/injection_tokens';
import { QueueNames } from '../../../../package/constants/src/queues_redis';

export class ChatMessageForUserService {
  private createQueue: CreateQueue;
  constructor(
    private readonly sendMessageToUserService: SendMessageToUserService,
    private readonly cassandraObject: CassandraDatabaseQueries,
    @Inject(InjectionTokens.CreateQueue) createQueue: CreateQueue,
  ) {
    this.createQueue = createQueue;
  }
  sendChatMessage = async (
    messageId: types.TimeUuid,
    chatId: types.TimeUuid,
    senderId: string,
    recieverId: string,
    message: string,
    sendingTime: Date,
    status: string,
    referredBy?: types.TimeUuid,
    delieveryTime?: Date,
    readingTime?: Date,
  ) => {
    const chatMessageModelForSender: ChatMessageModel = {
      message_id: messageId,
      chat_id: chatId,
      sender_id: senderId,
      reciever_id: recieverId,
      message: message,
      sending_time: sendingTime,
      delievery_time: delieveryTime,
      reading_time: readingTime,
      status: status,
      referred_by: referredBy,
      owner_id: senderId,
    };
    const chatMessageModelForReciever: ChatMessageModel = {
      message_id: messageId,
      chat_id: chatId,
      sender_id: senderId,
      reciever_id: recieverId,
      message: message,
      sending_time: sendingTime,
      delievery_time: delieveryTime,
      reading_time: readingTime,
      status: status,
      referred_by: referredBy,
      owner_id: recieverId,
    };
    await this.sendMessageToUserService.sendMessageToUser(
      chatMessageModelForReciever.reciever_id,
      false,
      EventNames.recieveChatMessage,
      chatMessageModelForReciever,
      convertChatMessageToCommonMessage(chatMessageModelForReciever),
      () => {},
      async () => {
        await this.cassandraObject.saveChatMessage(chatMessageModelForSender);
      },
    );
  };
  updateStatusOfChatMessages = async (
    sender_id: string, // This is not the id of sender of this request but the id of sender of message.
    updateStatusOfChatMessageModel: UpdateStatusOfChatMessageModel[],
    status: number,
  ): Promise<boolean> => {
    await this.sendMessageToUserService.sendMessageToUser(
      sender_id,
      false,
      EventNames.updateStatusOfChatMesssages,
      updateStatusOfChatMessageModel,
      convertUpdateStatusOfChatMessagesToCommonMessage(
        updateStatusOfChatMessageModel,
      ),
      () => {},
      async () => {
        const object = {
          sender_id: sender_id,
          updateStatusOfChatMessageModel: updateStatusOfChatMessageModel,
          status: status,
        };
        this.createQueue.createChannel((chnl) => {
          chnl.assertQueue(QueueNames.ReadChatMessageQueue);
          chnl.sendToQueue(
            QueueNames.ReadChatMessageQueue,
            Buffer.from(JSON.stringify(object)),
          );
        });
      },
    );
    return true;
  };

  deleteChatMessageForMe = async (
    deleteMessageModel: DeleteMessageModel[],
  ): Promise<boolean> => {
    this.createQueue.createChannel((chnl) => {
      chnl.assertQueue(QueueNames.DeleteMessageForMeQueue);
      chnl.sendToQueue(
        QueueNames.DeleteMessageForMeQueue,
        Buffer.from(JSON.stringify(deleteMessageModel)),
      );
    });
    return true;
  };

  deleteChatMessageForEveryOne = async (
    deleteMessageModel: DeleteMessageModel,
  ) => {
    await this.sendMessageToUserService.sendMessageToUser(
      deleteMessageModel.reciever_id,
      false,
      EventNames.deleteChatMessage,
      deleteMessageModel,
      convertDeleteMessasgeToCommonMessage(deleteMessageModel),
      () => {},
      async () => {
        await this.cassandraObject.deleteChatMessageForEveryone(
          deleteMessageModel,
        );
      },
    );
  };
}
