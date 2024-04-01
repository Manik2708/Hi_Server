import { ChatMessageModel } from "../../../Models/chat_message_model";
import { CassandraDatabaseQueries } from "../../../Database/Cassandra/queries";
import { SendMessageToUserService } from "../../../Services/send_message_to_user";
import { EventNames } from "../../../Constants/event_names";
import { convertChatMessageToCommonMessage } from "../../../Models/message_handler";
import { types } from "cassandra-driver";

export class ChatMessageForUserService{
    constructor(
        private readonly sendMessageToUserService: SendMessageToUserService,
        private readonly cassandraObject: CassandraDatabaseQueries,
      ) {}
      sendChatMessage = async(
        messageId: types.TimeUuid,
        chatId: types.TimeUuid,
        senderId: string,
        recieverId: string,
        message: string,
        sendingTime: Date,
        status: string,
        referredBy: types.TimeUuid,
        deletedBySender: boolean,
        deletedByReciever: boolean,
        delieveryTime?: Date,
        readingTime?: Date,
      )=>{
        const chatMessageModel: ChatMessageModel = {
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
          deletedByReciever: deletedByReciever,
          deletedBySender: deletedBySender
        }
        await this.sendMessageToUserService.sendMessageToUser(
          chatMessageModel.recieverId,
          false,
          EventNames.recieveChatMessage,
          chatMessageModel,
          convertChatMessageToCommonMessage(chatMessageModel) ,
          ()=>{},
          async()=>{
            await this.cassandraObject.saveChatMessage(chatMessageModel)
          }
        )
      }
      updateStatusOfChatMessages = async()=>{}
      deleteChatMessageForMe = async()=>{}
      deleteChatMessageForEveryOne = async()=>{}
      deleteMultipleMessagesForMe = async()=>{}
}