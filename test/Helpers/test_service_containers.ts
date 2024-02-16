import { RedisClientType } from "../../src/main";
import { createClient } from "redis";
import { Client as CasClient } from 'cassandra-driver';
import { CreateQueue } from "../../src/Queues/base";
import { RedisTestingLink, TestingCassandraContactPoint, TestingCassandraPort } from "../../src/enviornment_variables";
export class TestServiceContainers{
    static getTestingRedisClient=():RedisClientType=>{
        return  createClient({
            url: RedisTestingLink==undefined?"redis://0.0.0.0:6392":RedisTestingLink,
          });
    }
    static getTestingCassandraClient=():CasClient=>{
        return  new CasClient({
            contactPoints: [TestingCassandraContactPoint==undefined?"localhost":TestingCassandraContactPoint],
            localDataCenter: "datacenter1",
            protocolOptions: { port: TestingCassandraPort==undefined?9001:TestingCassandraPort },
          })
    }
    static getTestingRabbitClient=():CreateQueue=>{
        return new CreateQueue(true);
    }
}