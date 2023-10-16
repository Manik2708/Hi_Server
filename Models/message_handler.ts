import { confessionMessageType } from "../Constants/messasge_type";
import { ConfessionModel } from "./confession";

export interface MessageHandler{
    messageType: number;
    senderId?: string;
    senderAnonymousId?: string;
    crushId?: string;
    confession?: string;
    time?: string;
    status?: string;
    crushName?: string;
}
export const covertConfessionToCommonMessage=(confession: ConfessionModel):MessageHandler=>{
    return{
            messageType:confessionMessageType,
            senderId: confession.senderId,
            senderAnonymousId:confession.senderAnonymousId,
            crushId: confession.crushId,
            confession: confession.confession,
            time:confession.time,
            status: confession.status,
            crushName: confession.crushName 
    }
}

