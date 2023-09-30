import *  as EventNames from "../event_names"
import { Socket } from "socket.io";

export const tokenLost=(socket: Socket)=>{
    socket.emit(EventNames.tokenLost);
}

