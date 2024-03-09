import { OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WebSocketServices } from './Services/websocket_services';
import { WebSocketMessageError } from './Errors/websocket_message_not_sent_error';

@WebSocketGateway()
export class WebSocketsGateWay implements OnGatewayInit<Server> {
  constructor(private readonly webSocketServices: WebSocketServices) {}
  afterInit(ioServer: Server) {
    ioServer.on('connection', (socket) => {
      console.log('Connection To Sockets Successful ' + socket.id);
    });

    this.webSocketServices
      .getWebsocketEventSubject()
      .asObservable()
      .subscribe({
        next: (event) => {
          const socket = ioServer.sockets.sockets.get(event.id);
          if(socket==null){
            throw new WebSocketMessageError(); 
          }
          else{
            try{
              socket.emitWithAck(event.name, event.data);
            }catch(e){
              throw new WebSocketMessageError();
            }
          }
        },
      });
  }
}
