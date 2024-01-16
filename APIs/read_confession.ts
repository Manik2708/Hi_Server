import express from "express";
import { authMiddlewre } from "../Middlewares/user";
import * as EventNames from "../Constants/event_names";
import { cassandraObject, client } from "..";
import { sendMessageToUser } from "../Functions/sending_message_to_user";
import { ConfessionModel } from "../Models/confession";
import { convertUpdateConfessionStatusToCommonMessage } from "../Models/message_handler";
import { createChannel } from "../Queues/base";
import { UpdateConfessionStatusForSender } from "../Models/update_status_of_confession";
export const readConfession = express.Router();

readConfession.post("/read-confession", authMiddlewre, async (req, res) => {
  try {
    const {
      senderId,
      senderAnonymousId,
      crushId,
      confession,
      time,
      crushName,
      confessionId,
      lastUpdate,
    } = req.body;
    let confessionDb: ConfessionModel = {
      confessionId: confessionId,
      senderId: senderId,
      senderAnonymousId: senderAnonymousId,
      crushId: crushId,
      confession: confession,
      time: time,
      crushName: crushName,
      status: "Read",
      lastUpdate: lastUpdate,
    };
    const updateStatusOfConfession: UpdateConfessionStatusForSender = {
      confessionId: confessionId,
      updatedStatus: "Read",
      updateTime: lastUpdate,
    };
    sendMessageToUser(
      senderId,
      false,
      EventNames.readConfession,
      updateStatusOfConfession,
      convertUpdateConfessionStatusToCommonMessage(updateStatusOfConfession),
      req,
      client,
      () => {},
      createChannel,
      () => {
        cassandraObject.readConfession(confessionDb);
      },
    );
    return res.status(200);
  } catch (e: any) {
    return res.status(500).json({ msg: e.message });
  }
});
