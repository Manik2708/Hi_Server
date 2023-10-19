import * as MessageTypes from "../Constants/messasge_type";
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
