import { INestApplication } from '@nestjs/common';
import { io as IoClient, Socket as ClientSocket } from 'socket.io-client';

export const initClientSocket = async (
  app: INestApplication,
  callback: (socket: ClientSocket) => void,
) => {
  const url = await app.getUrl();
  return new Promise<ClientSocket>((resolve, reject) => {
    const socket = IoClient(url, {
      reconnectionDelay: 0,
    });

    socket.on('connect', () => {
      callback(socket);
      resolve(socket);
    });

    setTimeout(() => {
      reject(new Error('failed to connect wihtin 5 seconds.'));
    }, 5000);
  });
};
