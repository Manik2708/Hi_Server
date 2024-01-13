import { CassandraDatabaseQueries } from "../../Database/Cassandra/queries";
import {Client} from 'cassandra-driver';
export const getCassandraTestingClient=():CassandraDatabaseQueries=>{
    return new CassandraDatabaseQueries(new Client({
    contactPoints:['0.0.0.0'],
    localDataCenter: 'datacenter1',
    protocolOptions:{port: 9043}
}))
}