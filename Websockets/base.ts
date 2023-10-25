import {  ioServer } from "..";
import { onlineUsers } from "./user_online";
import { searchUser } from "./search_user";
import { client } from "..";
import { Socket } from "socket.io";
import { recieveAllMessages } from "./recieve_message";
import { appIsClosed } from "./app_is_closed";
import { RedisNames } from "../Constants/queues_redis";

var socketfotApis: Socket;
function connectToSocket(){
try{
ioServer.on('connection', (socket)=>{
    socketfotApis=socket;
    console.log('Connection To Sockets Successful '+socket.id);
    onlineUsers(socket, client);
    searchUser(socket);
    recieveAllMessages(socket);
    appIsClosed(socket, client);
});
}catch(e: any){
    console.log(e);
}
}

export{connectToSocket, socketfotApis};


