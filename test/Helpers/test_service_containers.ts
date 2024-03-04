import { RedisClientType } from '../../src/Constants/constant_types';
import { createClient } from 'redis';
import { Client as CasClient } from 'cassandra-driver';
import { CreateQueue } from '../../src/Queues/base';
import {
  RedisTestingLink,
  TestingCassandraContactPoint,
  TestingCassandraPort,
} from '../../src/enviornment_variables';
export class TestServiceContainers {
  static getTestingRedisClient = (): RedisClientType => {
    return createClient({
      url: 'redis://0.0.0.0:6392',
    });
  };
  static getTestingCassandraClient = (): CasClient => {
    return new CasClient({
      contactPoints: ['localhost'],
      localDataCenter: 'datacenter1',
      protocolOptions: { port: 9001 },
    });
  };
  static getTestingRabbitClient = (): CreateQueue => {
    return new CreateQueue(true);
  };
}
