import mongoose from "mongoose";
import { ConfessionModel } from "./confession";
import { ChatModel } from "./chat_model";

export interface UserModel extends mongoose.Document{
    name: String,
    username: String,
    email: String,
    password: String,
    dob: Date,
    isEmailVerified: Boolean,
    anonymousId: String,
    _doc?: any,
    sentConfessions: ConfessionModel[],
    recievedConfessions: ConfessionModel[],
    chats:ChatModel[]
}