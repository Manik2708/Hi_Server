import { ioServer } from "..";
import { client } from "..";
import { appIsClosed } from "./app_is_closed";

function connectToSocket() {
  try {
    ioServer.on("connection", (socket) => {
      console.log("Connection To Sockets Successful " + socket.id);
      appIsClosed(socket, client);
    });
  } catch (e: any) {
    console.log(e);
  }
}

export { connectToSocket };
