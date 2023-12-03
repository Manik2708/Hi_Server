import http from "http";
import { Server as IoServer, Socket as ServerSocket}  from "socket.io";
import {io as IoClient, Socket as ClientSocket} from 'socket.io-client';
import { getTestServerInsatnce } from "./server_instance";

export const envForTestingSocket = (httpServer: http.Server, callback:(serverSocket:ServerSocket, clientSocket:ClientSocket)=>void) => {
    try{
    const io=new IoServer(httpServer)
    const client=IoClient('http://localhost:3001')
    io.on('connection', (socket)=>{
        callback(socket, client)
    })
    }catch(e:any){
        console.log(e.toString())
    }
};