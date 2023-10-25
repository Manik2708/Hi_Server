import http from 'http';
import { Server, Socket } from 'socket.io';

export var socketForTesting:Socket|null
export const createTestingSocketServer=(server:http.Server,functionToTest?:(socket: Socket)=>void):Server|null=>{
   try{
    
    const ioServer=new Server(server);
    console.log('connected to socket server')
    ioServer.on('connection', (socket)=>{
        socketForTesting=socket
        if(functionToTest!=null){
            functionToTest(socket)
        }
    })
    console.log('socket server running')
    return ioServer
   }catch(e: any){
    console.log('Error in socket server'+e.toString())
    return null
   }
}
export const closeSocketServer=(socketServer:Server)=>{
    socketForTesting=null
    socketServer.removeAllListeners()
    socketServer.close();
}

export interface SocketServerProperties{
    socket:Socket,
    server:Server
}