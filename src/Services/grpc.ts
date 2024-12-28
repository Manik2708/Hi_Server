import { GetMessagesRequest, GetMessagesResponse, QueueServiceClient, SaveMessageRequest } from '../GRPC/server';
import { credentials } from '@grpc/grpc-js';
import { MessageHandler } from '../Models/message_handler';
import { InternalServerError } from '../Errors/server_error';
import { Transform } from 'stream';

export class GRPCServices {
  private client: QueueServiceClient;
  constructor(address: string) {
    this.client = new QueueServiceClient(address, credentials.createInsecure())
  }
  saveMessageForOfflineUser = (id: string, message: MessageHandler)=>{
    const req: SaveMessageRequest = {
      id: id,
      content: new TextEncoder().encode(JSON.stringify(message))
    }
    this.client.saveMessage(req, (err)=>{
      if (err) {
        throw new InternalServerError(err.message);
      }
    })
    this.client.close()
  }

  getMessageForOfflineUser = (id: string, responseStream: Transform)=> {
    const req: GetMessagesRequest = {
      id: id,
    }
    const stream = this.client.getMessages(req)
    stream.on('close', ()=>{
      this.client.close()
    })
    stream.pipe(responseStream)
  }
}