import mongoose from "mongoose";

export interface ConfessionModel extends mongoose.Document{
    senderId: string;
    senderAnonymousId: string;
    crushId: string;
    confession: string;
    time: string;
    status: string;
    crushName: string;
    lastUpdate:string;
}
