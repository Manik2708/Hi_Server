import { SendMessageToUserService } from 'src/Services/send_message_to_user';
import express from 'express';
import { ConfessionModel } from 'src/Models/confession';
import { EventNames } from 'src/Constants/event_names';
import {
  convertUpdateConfessionStatusToCommonMessage,
  covertConfessionToCommonMessage,
} from 'src/Models/message_handler';
import { CassandraDatabaseQueries } from 'src/Database/Cassandra/queries';
import { InternalServerError } from 'src/Errors/server_error';
import mongoose from 'mongoose';
import {
  UpdateConfessionStatus,
  UpdateConfessionStatusForSender,
} from 'src/Models/update_status_of_confession';
import { BadRequestError } from 'src/Errors/bad_request';
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
        confession,
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
      throw new BadRequestError(e.toString());
    }
  };
}
