import http from "http";
import { Server as IoServer, Socket as ServerSocket}  from "socket.io";
import {io as IoClient, Socket as ClientSocket} from 'socket.io-client';

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

export const exvForChatTestingSocket=(httpServer: http.Server, callback:(serverSocket:ServerSocket, client1:ClientSocket, client2:ClientSocket)=>void)=>{
    try{
        const io=new IoServer(httpServer)
        const client1=IoClient('http://localhost:3001')
        const client2=IoClient('http://localhost:3001')
        io.on('connection', (socket)=>{
            callback(socket, client1, client2)
        })
        }catch(e:any){
            console.log(e.toString())
        }
}