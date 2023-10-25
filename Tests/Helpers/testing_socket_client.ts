import {io, Socket} from 'socket.io-client'

export const createTestingSocketClient=(onConnectFunction?:(socket:Socket)=>void):Socket|null=>{
    try{
        const socket=io('http://localhost:3001')
    socket.on('connect', ()=>{
        console.log('Socket client connected')
        if(onConnectFunction!=null){
            onConnectFunction(socket)
        }
    })
    return socket
    }catch(e:any){
        console.log('Error in client side'+e.toString())
        return null
    }
}

