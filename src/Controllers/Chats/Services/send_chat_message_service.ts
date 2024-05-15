import { ChatMessageModel } from '../../../Models/chat_message_model';
import { CassandraDatabaseQueries } from '../../../Database/Cassandra/queries';
import { SendMessageToUserService } from '../../../Services/send_message_to_user';
import { EventNames } from '../../../Constants/event_names';
import {
  convertChatMessageToCommonMessage,
  convertDeleteMessasgeToCommonMessage,
  convertUpdateStatusOfChatMessagesToCommonMessage,
} from '../../../Models/message_handler';
import { types } from 'cassandra-driver';
import {
  DeleteMessageModel,
  UpdateStatusOfChatMessageModel,
} from '../../../Models/update_status_of_chat_message';
import { BadRequestError, BadRequestTypes } from '../../../Errors/bad_request';

export class ChatMessageForUserService {
  constructor(
    private readonly sendMessageToUserService: SendMessageToUserService,
    private readonly cassandraObject: CassandraDatabaseQueries,
  ) {}
  sendChatMessage = async (
    messageId: types.TimeUuid,
    chatId: types.TimeUuid,
    senderId: string,
    recieverId: string,
    message: string,
    sendingTime: Date,
    status: string,
    referredBy: types.TimeUuid,
    delieveryTime?: Date,
    readingTime?: Date,
  ) => {
    const chatMessageModelForSender: ChatMessageModel = {
      messageId: messageId,
      chatId: chatId,
      senderId: senderId,
      recieverId: recieverId,
      message: message,
      sendingTime: sendingTime,
      delieveryTime: delieveryTime,
      readingTime: readingTime,
      status: status,
      referredBy: referredBy,
      ownerId: senderId,
    };
    const chatMessageModelForReciever: ChatMessageModel = {
      messageId: messageId,
      chatId: chatId,
      senderId: senderId,
      recieverId: recieverId,
      message: message,
      sendingTime: sendingTime,
      delieveryTime: delieveryTime,
      readingTime: readingTime,
      status: status,
      referredBy: referredBy,
      ownerId: recieverId,
    };
    await this.sendMessageToUserService.sendMessageToUser(
      chatMessageModelForReciever.recieverId,
      false,
      EventNames.recieveChatMessage,
      chatMessageModelForReciever,
      convertChatMessageToCommonMessage(chatMessageModelForReciever),
      () => {},
      async () => {
        await this.cassandraObject.saveChatMessage(chatMessageModelForReciever);
        await this.cassandraObject.saveChatMessage(chatMessageModelForSender);
      },
    );
  };
  updateStatusOfChatMessages = async (
    crushId: string,
    updateStatusOfChatMessageModel: UpdateStatusOfChatMessageModel[],
    updatedStatus: number,
  ): Promise<boolean> => {
    await this.sendMessageToUserService.sendMessageToUser(
      crushId,
      false,
      EventNames.updateStatusOfChatMesssages,
      updateStatusOfChatMessageModel,
      convertUpdateStatusOfChatMessagesToCommonMessage(
        updateStatusOfChatMessageModel,
      ),
      () => {},
      async () => {
        if (updatedStatus == 0) {
          await this.cassandraObject.readMultipleChatMessages(
            updateStatusOfChatMessageModel,
          );
        } else if (updatedStatus == 1) {
          await this.cassandraObject.updateMultipleDelieveredMessages(
            updateStatusOfChatMessageModel,
          );
        } else {
          throw new BadRequestError(BadRequestTypes.UNKOWN_UPDATE_STATUS);
        }
      },
    );
    return true;
  };

  deleteChatMessageForMe = async (
    deleteMessageModel: DeleteMessageModel[],
  ): Promise<boolean> => {
    await this.cassandraObject.deleteChatMessageForMe(deleteMessageModel);
    return true;
  };

  deleteChatMessageForEveryOne = async (
    deleteMessageModel: DeleteMessageModel,
  ) => {
    await this.sendMessageToUserService.sendMessageToUser(
      deleteMessageModel.recieverId,
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
