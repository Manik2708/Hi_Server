import { createClient } from 'redis';

const typeClient = createClient();
export type RedisClientType = typeof typeClient;
