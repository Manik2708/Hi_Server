import { ioServer } from "..";
import { onlineUsers } from "./user_online";
import * as EventNames from '../event_names';
import { searchUser } from "./search_user";

import { Socket } from "socket.io";

var socketfotApis: Socket;
function connectToSocket(){
try{
ioServer.on('connection', (socket)=>{
    socketfotApis=socket;
    console.log('Connection To Sockets Successful '+socket.id);
    socket.emit(EventNames.socketId, socket.id);
    onlineUsers(socket);
    searchUser(socket);
});
}catch(e: any){
    console.log(e);
}
}

export{connectToSocket, socketfotApis};


