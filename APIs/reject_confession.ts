import express from "express";
import { authMiddlewre } from "../Middlewares/user";
import { sendMessageToUser } from "../Functions/sending_message_to_user";
import * as EventNames from "../Constants/event_names";
import {
  UpdateConfessionStatus,
  UpdateConfessionStatusForSender,
} from "../Models/update_status_of_confession";
import { convertUpdateConfessionStatusToCommonMessage } from "../Models/message_handler";
import { cassandraObject, client } from "..";
import { ioServer, createQueue } from "..";
const rejectConfession = express.Router();

rejectConfession.post("/reject-confession", authMiddlewre, async (req, res) => {
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
      updatedStatus: "Rejected",
      updateTime: time,
      sendingTime: sendingTime,
      readingTime: readingTime,
    };
    const updateConfessionStatusForSender: UpdateConfessionStatusForSender = {
      confessionId: confessionId,
      updatedStatus: "Rejected",
      updateTime: time,
    };
    await sendMessageToUser(
      updateConfssionStatus.senderId,
      true,
      EventNames.updateConfssionStatus,
      updateConfssionStatus,
      convertUpdateConfessionStatusToCommonMessage(
        updateConfessionStatusForSender,
      ),
      ioServer,
      client,
      () => {},
      createQueue,
      () => {
        cassandraObject.acceptOrRejectConfession(updateConfssionStatus);
      },
    );
    res.status(200).json(true);
  } catch (e: any) {
    console.log(e.toString());
    res.status(500).json({ msg: e.message });
  }
});

export { rejectConfession };
