import http from "http";
import { Server as IoServer, Socket as ServerSocket } from "socket.io";
import { io as IoClient, Socket as ClientSocket } from "socket.io-client";

export const initServerSocket = (
  server: http.Server,
  callback?: (socket: ServerSocket) => void,
): IoServer => {
  const io = new IoServer(server);
  io.on("connection", (socket) => {
    if (callback) {
      callback(socket);
    }
  });
  return io;
};

export const initClientSocket = (callback: (socket: ClientSocket) => void) => {
  return new Promise<ClientSocket>((resolve, reject) => {
    const socket = IoClient("http://localhost:3001", {
      reconnectionDelay: 0,
    });

    socket.on("connect", () => {
      callback(socket);
      resolve(socket);
    });

    setTimeout(() => {
      reject(new Error("failed to connect wihtin 5 seconds."));
    }, 5000);
  });
};
