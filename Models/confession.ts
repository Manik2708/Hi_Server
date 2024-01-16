import mongoose from "mongoose";

export interface ConfessionModel {
  confessionId: string;
  senderId: string;
  senderAnonymousId: string;
  crushId: string;
  confession: string;
  time: string;
  status: string;
  crushName: string;
  lastUpdate: string;
}
