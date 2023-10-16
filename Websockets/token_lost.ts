import *  as EventNames from "../Constants/event_names"
import { Socket } from "socket.io";

export const tokenLost=(socket: Socket)=>{
    socket.emit(EventNames.tokenLost);
}

