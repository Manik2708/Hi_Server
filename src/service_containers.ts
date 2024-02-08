import { CreateQueue } from './Queues/base';
import { ConnectToServices } from './Services/connect_to_services';

export const createQueue: CreateQueue = new CreateQueue();
export const client = ConnectToServices.createRedisClient();
export const casClient = ConnectToServices.createCassandra();
