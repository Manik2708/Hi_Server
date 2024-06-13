import { io as IoClient, Socket as ClientSocket } from 'socket.io-client';

export const initClientSocket = async (
  userId: string,
  callback: (socket: ClientSocket) => void,
) => {
  return new Promise<ClientSocket>((resolve, reject) => {
    const socket = IoClient('http://localhost:3500', {
      reconnectionDelay: 0,
    });

    socket.on('connect', () => {
      socket.emit('subscribe', {
        userId: userId,
      });
      callback(socket);
      resolve(socket);
    });

    setTimeout(() => {
      reject(new Error('failed to connect wihtin 5 seconds.'));
    }, 5000);
  });
};
