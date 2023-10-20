import * as MessageTypes from "../Constants/messasge_type";
import { ChatModel } from "./chat_model";
import { ConfessionModel } from "./confession";
import { UpdateConfessionStatus } from "./update_status_of_confession";

export interface MessageHandler{
    messageType: number;
    senderId?: string;
    senderAnonymousId?: string;
    crushId?: string;
    confession?: string;
    time?: string;
    status?: string;
    crushName?: string;
    confessionId?: string;
    confessionUpdatedStatus?: string;
    anonymousUserId?: string;
}
export const covertConfessionToCommonMessage=(confession: ConfessionModel):MessageHandler=>{
    return{
            messageType:MessageTypes.confessionMessageType,
            senderId: confession.senderId,
            senderAnonymousId:confession.senderAnonymousId,
            crushId: confession.crushId,
            confession: confession.confession,
            time:confession.time,
            status: confession.status,
            crushName: confession.crushName 
    }
}
export const convertUpdateConfessionStatusToCommonMessage=(updatedConfession: UpdateConfessionStatus):MessageHandler=>{
    return {
           messageType:MessageTypes.updateConfessionStatusMessageType,
           confessionId: updatedConfession.confessionId,
           confessionUpdatedStatus:updatedConfession.updatedStatus 
    }
}

export const convertCreateChatMessageToCommonMessage=(chat: ChatModel): MessageHandler=>{
    return {
        messageType: MessageTypes.createChatMessageType,
        crushId: chat.crushId,
        anonymousUserId: chat.anonymousUserId,
        confessionId: chat.confessionId
    }
}