import { RedisClientType } from "..";
import { Client as CasClient } from "cassandra-driver";
import { IP, IfRunningOnDocker } from "../enviornment_variables";
import { createClient } from "redis";
import { Server } from "socket.io";
import http from "http";
import { ApiContainer } from "../api_containers";

export class ConnectToServices {
  static createRedisClient = (): RedisClientType => {
    let client: RedisClientType;

    if (IfRunningOnDocker == "true") {
      client = createClient({
        url: "redis://client:6379",
      });
    } else {
      client = createClient({});
    }
    return client;
  };
  static createCassandra = (): CasClient => {
    let casClient: CasClient;
    if (IfRunningOnDocker == "true") {
      casClient = new CasClient({
        contactPoints: ["cassandra:9042"],
        localDataCenter: "datacenter1",
      });
    } else {
      casClient = new CasClient({
        contactPoints: ["0.0.0.0"],
        localDataCenter: "datacenter1",
      });
    }
    return casClient;
  };
  static createHttpServer = (): http.Server => {
    const server = http.createServer(ApiContainer.registerApiInContainer());
    server.listen(3000, IP, () => {
      console.log("Connected!");
    });
    return server;
  };
  static createIoServer = (server: http.Server): Server => {
    return new Server(server);
  };
}
