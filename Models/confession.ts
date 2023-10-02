import mongoose from "mongoose";

export interface ConfessionModel extends mongoose.Document{
    SenderId: string;
    SenderAnonymousId: string;
    CrushId: string;
    Confession: string;
    Time: string;
    status: string;
    crushName: string;
}