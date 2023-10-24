import http from 'http';
import { Server, Socket } from 'socket.io';
export var socketForTesting:Socket|null
export const constCreateTestingSocketServer=(server: http.Server, functionToTest:(socket: Socket)=>void)=>{
    const ioServer=new Server(server);
    ioServer.on('connection', (socket)=>{
        socketForTesting=socket
        functionToTest(socket)
    })
}
export const closeSocketServer=(socketServer:Server)=>{
    socketForTesting=null
    socketServer.removeAllListeners()
    socketServer.close();
}