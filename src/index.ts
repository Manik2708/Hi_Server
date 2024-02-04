import mongoose from 'mongoose';
import { connectToSocket } from './Websockets/base';
import { createClient } from 'redis';
import admin from 'firebase-admin';
import { DatabaseUrl, FirebasePath } from './enviornment_variables';
import { casClient, client } from './service_containers';
import waitOn from 'wait-on';
import { CassandraDatabaseQueries } from './Database/Cassandra/queries';

const conf = require(FirebasePath);
const Db = DatabaseUrl;

const typeClient = createClient();
export type RedisClientType = typeof typeClient;
mongoose
  .connect(Db)
  .then(() => {
    console.log('Connected to Database');
  })
  .catch((e) => console.log(e.message));
let cassandraObject: CassandraDatabaseQueries = new CassandraDatabaseQueries(
  casClient,
);
const connect = async () => {
  await client.connect();
  client.on('error', (err) => console.log('Redis Client Error', err));
  waitOn({ resources: ['tcp:cassandra:9042'], timeout: 30000 }, (err: any) => {
    if (err) {
      console.log(err);
    } else {
      cassandraObject.connectAndCreateTables();
    }
  });
};
admin.initializeApp({
  credential: admin.credential.cert(conf),
});
connect();
connectToSocket();
