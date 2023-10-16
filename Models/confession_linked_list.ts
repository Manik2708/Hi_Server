import { ConfessionModel } from "./confession";

export interface ConfessionLinkedList{
    senderId: string;
    senderAnonymousId: string;
    confession: string;
    time: string;
    nextConfessionId:string|null;
    previousConfessionId: string|null;
}