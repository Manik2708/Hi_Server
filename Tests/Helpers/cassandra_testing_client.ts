import { CassandraDatabaseQueries } from "../../Database/Cassandra/queries";
import { Client } from "cassandra-driver";
export const getCassandraTestingClient = (): CassandraDatabaseQueries => {
  return new CassandraDatabaseQueries(
    new Client({
      contactPoints: ["cassandra-testing"],
      localDataCenter: "datacenter1",
      protocolOptions: { port: 9043 },
    }),
  );
};
