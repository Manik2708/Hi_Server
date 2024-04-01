import { SendMessageToUserService } from '../../../Services/send_message_to_user';
import { ConfessionModel } from '../../../Models/confession';
import { CassandraDatabaseQueries } from '../../../Database/Cassandra/queries';
import { types } from 'cassandra-driver';
import {
  UpdateConfessionStatus,
  UpdateConfessionStatusForSender,
} from '../../../Models/update_status_of_confession';
import { EventNames } from '../../../Constants/event_names';
import {
  convertAcceptConfessionStatusToCommonMessage,
  convertUpdateConfessionStatusToCommonMessage,
  covertConfessionToCommonMessage,
} from '../../../Models/message_handler';
import { InternalServerError } from '../../../Errors/server_error';
import { ChatModel } from '../../../Models/chat_model';
import { AcceptConfessionStatus } from '../../../Models/update_status_of_confession';
export class ConfessionServices {
  constructor(
    private readonly sendMessageToUserService: SendMessageToUserService,
    private readonly cassandraObject: CassandraDatabaseQueries,
  ) {}

  sendConfessionToUser = async (
    senderId: string,
    senderAnonymousId: string,
    crushId: string,
    confession: string,
    time: Date,
    crushName: string,
  ): Promise<ConfessionModel> => {
    try {
      const confessionId = types.TimeUuid.now();
      let confessionDb: ConfessionModel = {
        confessionId: confessionId.toString(),
        senderId: senderId,
        senderAnonymousId: senderAnonymousId,
        crushId: crushId,
        confession: confession,
        sendingTime: time,
        crushName: crushName,
        status: 'Sent',
      };
      await this.sendMessageToUserService.sendMessageToUser(
        crushId,
        false,
        EventNames.recieveConfession,
        confessionDb,
        covertConfessionToCommonMessage(confessionDb),
        async () => {},
        async () => {
          await this.cassandraObject.saveConfessionToCassandra(confessionDb);
        },
      );
      return confessionDb;
    } catch (e: any) {
      throw new InternalServerError(e.toString());
    }
  };
  readConfession = async (
    confessionId: string,
    senderId: string,
    senderAnonymousId: string,
    crushId: string,
    confession: string,
    sendingTime: Date,
    crushName: string,
    readingTime: Date,
  ) => {
    const confessionDb: ConfessionModel = {
      confessionId: confessionId,
      senderId: senderId,
      senderAnonymousId: senderAnonymousId,
      crushId: crushId,
      confession: confession,
      sendingTime: sendingTime,
      crushName: crushName,
      status: 'Read',
      readingTime: readingTime,
    };
    const updateConfessionStatusForSender: UpdateConfessionStatusForSender = {
      confessionId: confessionId,
      updatedStatus: 'Read',
      updateTime: readingTime,
    };
    await this.sendMessageToUserService.sendMessageToUser(
      crushId,
      false,
      EventNames.updateConfssionStatus,
      updateConfessionStatusForSender,
      convertUpdateConfessionStatusToCommonMessage(
        updateConfessionStatusForSender,
      ),
      async () => {},
      async () => {
        await this.cassandraObject.readConfession(confessionDb);
      },
    );
  };
  rejectConfession = async (
    senderId: string,
    sendingTime: Date,
    crushId: string,
    time: Date,
    readingTime: Date,
    confessionId: string,
  ): Promise<boolean> => {
    try {
      const updateConfssionStatus: UpdateConfessionStatus = {
        senderId: senderId,
        crushId: crushId,
        confessionId: confessionId,
        updatedStatus: 'Rejected',
        updateTime: time,
        sendingTime: sendingTime,
        readingTime: readingTime,
      };
      const updateConfessionStatusForSender: UpdateConfessionStatusForSender = {
        confessionId: confessionId,
        updatedStatus: 'Rejected',
        updateTime: time,
      };
      await this.sendMessageToUserService.sendMessageToUser(
        updateConfssionStatus.senderId,
        true,
        EventNames.updateConfssionStatus,
        updateConfssionStatus,
        convertUpdateConfessionStatusToCommonMessage(
          updateConfessionStatusForSender,
        ),
        () => {},
        async() => {
          await this.cassandraObject.acceptOrRejectConfession(updateConfssionStatus);
        },
      );
      return true;
    } catch (e: any) {
      throw new InternalServerError(e.toString());
    }
  };
  acceptConfession = async(
    senderId: string,
    sendingTime: Date,
    crushId: string,
    time: Date,
    readingTime: Date,
    confessionId: string,
    crushName: string,
    anonymousId: string
  ): Promise<ChatModel>=>{
    const updateConfssionStatus: UpdateConfessionStatus = {
      senderId: senderId,
      crushId: crushId,
      confessionId: confessionId,
      updatedStatus: 'Accepted',
      updateTime: time,
      sendingTime: sendingTime,
      readingTime: readingTime,
    };
    const updateConfessionStatusForSender: UpdateConfessionStatusForSender = {
      confessionId: confessionId,
      updatedStatus: 'Accepted',
      updateTime: time,
    };
    const chatModel: ChatModel ={
      chatId: types.TimeUuid.now(),
      crushName: crushName,
      crushId: crushId,
      userId: senderId,
      anonymousUserId: anonymousId,
      lastUpdate: new Date(),
      confessionId: confessionId,
      messages: []
    }
    const acceptConfessionModel: AcceptConfessionStatus={
      chatModel: chatModel,
      updatedStatus: "Accepted"
    }
    await this.sendMessageToUserService.sendMessageToUser(
      updateConfssionStatus.senderId,
      true,
      EventNames.acceptConfession,
      acceptConfessionModel,
      convertAcceptConfessionStatusToCommonMessage(acceptConfessionModel),
      () => {},
      async() => {
        await this.cassandraObject.acceptOrRejectConfession(updateConfssionStatus);
        await this.cassandraObject.createChat(chatModel)
      },
    );
    return chatModel;
  }
}
