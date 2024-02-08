import { RedisClientType } from '../main';
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
        url: 'redis://client:6379',
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
        contactPoints: ['cassandra:9042'],
        localDataCenter: 'datacenter1',
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
