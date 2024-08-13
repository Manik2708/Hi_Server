import { SendMessageToUserService } from '../../../Services/send_message_to_user';
import { ConfessionModel } from '../../../../package/database/src/Models/confession';
import { CassandraDatabaseQueries } from '../../../Database/Cassandra/queries';
import { types } from 'cassandra-driver';
import {
  UpdateConfessionStatus,
  UpdateConfessionStatusForSender,
} from '../../../../package/database/src/Models/update_status_of_confession';
import { EventNames } from '../../../../package/constants/src/event_names';
import {
  convertAcceptConfessionStatusToCommonMessage,
  convertUpdateConfessionStatusToCommonMessage,
  covertConfessionToCommonMessage,
} from '../../../../package/database/src/Models/message_handler';
import { InternalServerError } from '../../../../package/errors/src/server_error';
import { ChatModel } from '../../../../package/database/src/Models/chat_model';
import { AcceptConfessionStatus } from '../../../../package/database/src/Models/update_status_of_confession';
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
        confession_id: confessionId.toString(),
        sender_id: senderId,
        sender_anonymous_id: senderAnonymousId,
        crush_id: crushId,
        confession: confession,
        sending_time: time,
        crush_name: crushName,
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
      confession_id: confessionId,
      sender_id: senderId,
      sender_anonymous_id: senderAnonymousId,
      crush_id: crushId,
      confession: confession,
      sending_time: sendingTime,
      crush_name: crushName,
      status: 'READ',
      reading_time: readingTime,
    };
    const updateConfessionStatusForSender: UpdateConfessionStatusForSender = {
      confession_id: confessionId,
      updated_status: 'READ',
      update_time: readingTime,
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
        sender_id: senderId,
        crush_id: crushId,
        confession_id: confessionId,
        updated_status: 'REJECTED',
        update_time: time,
        sending_time: sendingTime,
        reading_time: readingTime,
      };
      const updateConfessionStatusForSender: UpdateConfessionStatusForSender = {
        confession_id: confessionId,
        updated_status: 'REJECTED',
        update_time: time,
      };
      await this.sendMessageToUserService.sendMessageToUser(
        updateConfssionStatus.sender_id,
        true,
        EventNames.updateConfssionStatus,
        updateConfessionStatusForSender,
        convertUpdateConfessionStatusToCommonMessage(
          updateConfessionStatusForSender,
        ),
        () => {},
        async () => {
          await this.cassandraObject.acceptOrRejectConfession(
            updateConfssionStatus,
          );
        },
      );
      return true;
    } catch (e: any) {
      throw new InternalServerError(e.toString());
    }
  };
  acceptConfession = async (
    senderId: string,
    sendingTime: Date,
    crushId: string,
    time: Date,
    readingTime: Date,
    confessionId: string,
    crushName: string,
    anonymousId: string,
  ): Promise<ChatModel> => {
    const updateConfssionStatus: UpdateConfessionStatus = {
      sender_id: senderId,
      crush_id: crushId,
      confession_id: confessionId,
      updated_status: 'ACCEPTED',
      update_time: time,
      sending_time: sendingTime,
      reading_time: readingTime,
    };
    const chatModel: ChatModel = {
      chat_id: types.TimeUuid.now(),
      crush_name: crushName,
      crush_id: crushId,
      user_id: senderId,
      anonymous_id: anonymousId,
      last_update: time,
      confession_id: confessionId,
      messages: [],
    };
    const acceptConfessionModel: AcceptConfessionStatus = {
      chat_model: chatModel,
      updated_status: 'ACCEPTED',
      update_time: time,
    };
    await this.sendMessageToUserService.sendMessageToUser(
      updateConfssionStatus.sender_id,
      true,
      EventNames.acceptConfession,
      acceptConfessionModel,
      convertAcceptConfessionStatusToCommonMessage(acceptConfessionModel),
      () => {},
      async () => {
        await this.cassandraObject.acceptOrRejectConfession(
          updateConfssionStatus,
        );
        await this.cassandraObject.createChat(chatModel);
      },
    );
    return chatModel;
  };
}
