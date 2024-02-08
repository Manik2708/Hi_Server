import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class WebSocketServices {
  private eventSubject: Subject<SocketEventSubject> =
    new Subject<SocketEventSubject>();

  getWebsocketEventSubject = (): Subject<SocketEventSubject> => {
    return this.eventSubject;
  };

  addEvent = (object: SocketEventSubject) => {
    this.eventSubject.next(object);
  };
}

export interface SocketEventSubject {
  id: string;
  name: string;
  data: unknown;
}
