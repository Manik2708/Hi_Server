import { SendMessageToUserService } from '../../../Services/send_message_to_user';
import express from 'express';
import { ConfessionModel } from '../../../Models/confession';
import { CassandraDatabaseQueries } from '../../../Database/Cassandra/queries';
import mongoose from 'mongoose';
import {
  UpdateConfessionStatus,
  UpdateConfessionStatusForSender,
} from '../../../Models/update_status_of_confession';
import { EventNames } from '../../../Constants/event_names';
import {
  convertUpdateConfessionStatusToCommonMessage,
  covertConfessionToCommonMessage,
} from '../../../Models/message_handler';
import { InternalServerError } from '../../../Errors/server_error';
export class ConfessionServices {
  constructor(
    private readonly sendMessageToUserService: SendMessageToUserService,
    private readonly cassandraObject: CassandraDatabaseQueries,
  ) {}

  sendConfessionToUser = async (
    req: express.Request,
    res: express.Response,
  ) => {
    try {
      const {
        senderId,
        senderAnonymousId,
        crushId,
        confession,
        time,
        crushName,
      } = req.body;
      let confessionDb: ConfessionModel = {
        confessionId: mongoose.Types.ObjectId.toString(),
        senderId: senderId,
        senderAnonymousId: senderAnonymousId,
        crushId: crushId,
        confession: confession,
        time: time,
        crushName: crushName,
        status: 'Sent',
        lastUpdate: time,
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
      return res.status(200).json(confessionDb);
    } catch (e: any) {
      throw new InternalServerError(e.toString());
    }
  };
  rejectConfession = async (req: express.Request, res: express.Response) => {
    try {
      const {
        senderId,
        sendingTime,
        crushId,
        time,
        readingTime,
        confessionId,
      } = req.body;
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
        () => {
          this.cassandraObject.acceptOrRejectConfession(updateConfssionStatus);
        },
      );
      res.status(200).json(true);
    } catch (e: any) {
      throw new InternalServerError(e.toString());
    }
  };
}
