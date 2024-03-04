import { OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WebSocketServices } from './Services/websocket_services';

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
          ioServer.to(event.id).emit(event.name, event.data);
        },
      });
  }
}
