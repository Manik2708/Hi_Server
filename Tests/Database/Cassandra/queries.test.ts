import {
  afterAll,
  beforeAll,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "vitest";
import { CassandraDatabaseQueries } from "../../../Database/Cassandra/queries";
import { getCassandraTestingClient } from "../../Helpers/cassandra_testing_client";
import { ConfessionModel } from "../../../Models/confession";
import { nanoid } from "nanoid";
import {
  CassandraMethods,
  CassandraTableNames,
} from "../../../Constants/cassandra_constants";

describe("Cassandra queries tests", () => {
  describe("Whether the connection, keyspace and tables are right", () => {
    let cassandraClient: CassandraDatabaseQueries;
    beforeEach(() => {
      cassandraClient = getCassandraTestingClient();
    });
    afterEach(() => {
      cassandraClient.getClient().shutdown();
    });
    it("Connecting and creating tables function test", async () => {
      await cassandraClient.connectAndCreateTables();
      const keySpaceName = await cassandraClient
        .getClient()
        .execute(
          "SELECT * FROM system_schema.keyspaces WHERE keyspace_name= ?",
          ["hi_database"],
        );
      expect(keySpaceName.rows.length).toBe(1);
      expect(keySpaceName.rows[0]["keyspace_name"]).toBe("hi_database");
      expect(keySpaceName.rows[0]["replication"]["class"]).toBe(
        "org.apache.cassandra.locator.SimpleStrategy",
      );
      expect(keySpaceName.rows[0]["replication"]["replication_factor"]).toBe(
        "1",
      );
    });
  });
  describe("Queries test", () => {
    let cassandraClient: CassandraDatabaseQueries;
    beforeEach(async () => {
      cassandraClient = getCassandraTestingClient();
      await cassandraClient.connectAndCreateTables();
    });
    afterEach(() => {
      cassandraClient.getClient().shutdown();
    });
    it("Saving confession method", async () => {
      const confessionId: string = nanoid().toLowerCase();
      const senderId: string = nanoid().toLowerCase();
      const senderAnonymousId: string = nanoid().toLowerCase();
      const crushId: string = nanoid().toLowerCase();
      const crushName: string = nanoid().toLowerCase();
      const confessionModel: ConfessionModel = {
        confessionId: confessionId,
        senderId: senderId,
        senderAnonymousId: senderAnonymousId,
        crushId: crushId,
        confession: "confession",
        crushName: crushName,
        time: Date.now().toString(),
        status: "Sent",
        lastUpdate: Date.now().toString(),
      };
      await cassandraClient.saveConfessionToCassandra(confessionModel);
      const tableOutput = await cassandraClient.getClient().execute(
        `SELECT * FROM ${CassandraTableNames.sentConfessions} WHERE 
        ${CassandraMethods.getSentConfessionsKey().PARTITION_KEY}= ? AND
        ${CassandraMethods.getSentConfessionsKey().FIRST_SORTING_KEY}=? AND
        ${CassandraMethods.getSentConfessionsKey().SECOND_SORTING_KEY}=?
        `,
        [
          confessionModel.senderId,
          confessionModel.time,
          confessionModel.confessionId,
        ],
      );
      expect(tableOutput.rows[0]["sender_id"]).toBe(senderId);
      expect(tableOutput.rows[0]["confession_id"]).toBe(confessionId);
      expect(tableOutput.rows[0]["confession"]).toBe("confession");
      expect(tableOutput.rows[0]["crush_name"]).toBe(crushName);
      expect(tableOutput.rows[0]["crush_id"]).toBe(crushId);
    });
  });
});
