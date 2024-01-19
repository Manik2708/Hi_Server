import express from "express";
import { authMiddlewre } from "../Middlewares/user";
import * as EventNames from "../Constants/event_names";
import { covertConfessionToCommonMessage } from "../Models/message_handler";
import { sendMessageToUser } from "../Functions/sending_message_to_user";
import { cassandraObject, client } from "..";
import { ConfessionModel } from "../Models/confession";
import mongoose from "mongoose";
import { ioServer, createQueue } from "..";

const sendConfession = express.Router();

sendConfession.post("/send-confession", authMiddlewre, async (req, res) => {
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
      status: "Sent",
      lastUpdate: time,
    };
    await sendMessageToUser(
      crushId,
      false,
      EventNames.recieveConfession,
      confessionDb,
      covertConfessionToCommonMessage(confessionDb),
      ioServer,
      client,
      async () => {},
      createQueue,
      () => {
        cassandraObject.saveConfessionToCassandra(confessionDb);
      },
    );
    return res.status(200).json(confessionDb);
  } catch (e: any) {
    return res.status(500).json({ msg: e.message });
  }
});
export { sendConfession };
