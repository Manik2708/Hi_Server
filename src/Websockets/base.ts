import { ioServer } from "../service_containers";
import { client } from "../service_containers";
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
