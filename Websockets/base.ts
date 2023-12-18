import {  ioServer } from "..";
import { searchUser } from "./search_user";
import { client } from "..";
import { appIsClosed } from "./app_is_closed";
import { recieveAllMessages } from "./recieve_all_kind_of_messages";


function connectToSocket(){
try{
ioServer.on('connection', (socket)=>{
    console.log('Connection To Sockets Successful '+socket.id);
    recieveAllMessages(socket);
    searchUser(socket);
    appIsClosed(socket, client);
});
}catch(e: any){
    console.log(e);
}
}

export{connectToSocket};


