import { ioServer } from "..";
import { onlineUsers } from "./user_online";
import { searchUser } from "./search_user";

import { Socket } from "socket.io";
import { recieveAllMessages } from "./recieve_message";
import { appIsClosed } from "./app_is_closed";

var socketfotApis: Socket;
function connectToSocket(){
try{
ioServer.on('connection', (socket)=>{
    socketfotApis=socket;
    console.log('Connection To Sockets Successful '+socket.id);
    onlineUsers(socket);
    searchUser(socket);
    recieveAllMessages(socket);
    appIsClosed(socket);
});
}catch(e: any){
    console.log(e);
}
}

export{connectToSocket, socketfotApis};


