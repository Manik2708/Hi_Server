import { Inject } from '@nestjs/common';
import { InjectionTokens } from '../../../Constants/injection_tokens';
import { GRPCServices } from '../../../Services/grpc';
import { Transform } from 'stream';
import { GetMessagesResponse } from '../../../GRPC/server';

export class RetrieveDataServices {
  private readonly grpcAddress: string;
  constructor(
    @Inject(InjectionTokens.GRPClientAddress) grpcAddress: string,
  ) {
    this.grpcAddress = grpcAddress;
  }

  retrieveDataForOfflineUsers = (id: string): Transform => {
    const client = new GRPCServices(this.grpcAddress);
    const stream = new OfflineDataTransform({objectMode: true})
    client.getMessageForOfflineUser(id, stream)
    return stream
  };
}

class OfflineDataTransform extends Transform {
  _transform(chunk: GetMessagesResponse, _: BufferEncoding, callback: (error?: Error | null, data?: any) => void): any {
    const decoder = new TextDecoder("utf-8");
    const obj = JSON.parse(decoder.decode(chunk.content))
    delete obj.message_type;
    callback(null, obj);
  }
}
