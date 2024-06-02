import { RedisClientType } from '../Constants/constant_types';
import { Client as CasClient } from 'cassandra-driver';
import { IP, IfRunningOnDocker } from '../enviornment_variables';
import { createClient } from 'redis';
import { Server } from 'socket.io';
import http from 'http';

export class ConnectToServices {
  static createRedisClient = (): RedisClientType => {
    let client: RedisClientType;

    if (IfRunningOnDocker == 'true') {
      client = createClient({
        url: 'redis://0.0.0.0:6390',
      });
    } else {
      client = createClient({});
    }
    return client;
  };
  static createCassandra = (): CasClient => {
    let casClient: CasClient;
    if (IfRunningOnDocker == 'true') {
      casClient = new CasClient({
      contactPoints: ['localhost'],
      localDataCenter: 'datacenter1',
      protocolOptions: { port: 9000 },
      });
    } else {
      casClient = new CasClient({
        contactPoints: ['172.17.0.2'],
        localDataCenter: 'datacenter1',
      });
    }
    return casClient;
  };
  static createIoServer = (server: http.Server): Server => {
    return new Server(server);
  };
}
