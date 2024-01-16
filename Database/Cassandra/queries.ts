import { Client } from "cassandra-driver";
import { ConfessionModel } from "../../Models/confession";
import {
  CassandraMethods,
  CassandraTableNames,
} from "../../Constants/cassandra_constants";
import { UpdateConfessionStatus } from "../../Models/update_status_of_confession";

export class CassandraDatabaseQueries {
  private client: Client;
  constructor(client: Client) {
    this.client = client;
  }

  getClient = (): Client => this.client;

  connectAndCreateTables = async (): Promise<void> => {
    try {
      await this.client.connect();

      // This method creates a keyspace in which our all of the data will be stored
      this.client.execute(`
    CREATE KEYSPACE hi_database
    WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
    `);

      // This method uses that keyspace to perform queries
      this.client.execute(`USE hi_database`);

      // Create Table for saving confession for sender in Database, The table constitutes of:
      // sender_id: The id of user who is sending confession
      // crush_id: The id of user to which confession is sent
      // confession_id: The id of confession which will make primary key unique
      // confession: The message
      // time: Time of sending confession
      // status: Sent, Recieved, Accepted, Rejected
      // crush_name: The name which will be displayed to the sender client
      this.client.execute(
        `CREATE TABLE IF NOT EXISTS ${CassandraTableNames.sentConfessions}(
            sender_id TEXT,
            crush_id TEXT,
            confession_id TEXT,
            confession TEXT,
            time TEXT,
            status TEXT,
            crush_name TEXT,
            last_update TEXT,
            PRIMARY KEY (sender_id, time, confession_id)
            );`,
      );
      // Create Table for saving unread confessions for reciever in Database, The table constitutes of:
      // sender_id: The id of user who is sending confession
      // crush_id: The id of user to which confession is sent
      // confession_id: The id of confession which will make primary key unique
      // confession: The message
      // time: Time of sending confession
      // status: Sent, Recieved, Accepted, Rejected
      // anonymous_id: The name which will be displayed to the reciever client
      this.client.execute(
        `CREATE TABLE IF NOT EXISTS ${CassandraTableNames.recievedUnreadConfessions}(
            sender_id TEXT,
            crush_id TEXT,
            confession_id TEXT,
            confession TEXT,
            time TEXT,
            status TEXT,
            anonymous_id TEXT,
            PRIMARY KEY (crush_id, time, confession_id)
            );`,
      );
      // Create Table for saving read confessions for reciever in Database, The table constitutes of:
      // sender_id: The id of user who is sending confession
      // crush_id: The id of user to which confession is sent
      // confession_id: The id of confession which will make primary key unique
      // confession: The message
      // time: Time of sending confession
      // status: Sent, Read, Accepted, Rejected
      // anonymous_id: The name which will be displayed to the reciever client
      // last_update: The time of reading confession
      this.client.execute(
        `CREATE TABLE IF NOT EXISTS ${CassandraTableNames.recievedReadConfessions}(
            sender_id TEXT,
            crush_id TEXT,
            confession_id TEXT,
            confession TEXT,
            time TEXT,
            status TEXT,
            anonymous_id TEXT,
            last_update TEXT,
            PRIMARY KEY (crush_id, last_update, confession_id)
            );`,
      );
    } catch (e: any) {
      console.log(e.toString());
    }
  };

  saveConfessionToCassandra = (confessionModel: ConfessionModel) => {
    try {
      // This function saves confession for saving it for sender
      this.client.execute(
        `INSERT INTO ${CassandraTableNames.sentConfessions}(
            sender_id,
            crush_id,
            confession_id,
            confession,
            time,
            status,
            crush_name,
            last_update TEXT  
        );`,
        [
          confessionModel.senderId,
          confessionModel.crushId,
          confessionModel.confessionId,
          confessionModel.confession,
          confessionModel.time,
          confessionModel.status,
          confessionModel.crushName,
          confessionModel.lastUpdate,
        ],
      );
      // This method saves confession for saving it for reviever
      this.client.execute(
        `INSERT INTO ${CassandraTableNames.recievedUnreadConfessions}(
            sender_id,
            crush_id,
            confession_id,
            confession,
            time,
            status,
            anonymous_id, 
        );`,
        [
          confessionModel.senderId,
          confessionModel.crushId,
          confessionModel.confessionId,
          confessionModel.confession,
          confessionModel.time,
          confessionModel.status,
          confessionModel.senderAnonymousId,
        ],
      );
    } catch (e: any) {
      console.log(e.toString());
    }
  };

  readConfession = (confessionModel: ConfessionModel): void => {
    try {
      // Firstly confession is removed from recieved_unread_confession
      const { PARTITION_KEY, FIRST_SORTING_KEY, SECOND_SORTING_KEY } =
        CassandraMethods.getRecievedUnreadConfessionsKey();
      this.client.execute(
        `DELETE FROM ${CassandraTableNames.recievedUnreadConfessions} WHERE ${PARTITION_KEY} = ? AND ${FIRST_SORTING_KEY} = ? AND ${SECOND_SORTING_KEY} = ?`,
        [
          confessionModel.crushId,
          confessionModel.time,
          confessionModel.confessionId,
        ],
      );
      // Add this confession to recieved_read_confession
      this.client.execute(
        `INSERT INTO ${CassandraTableNames.recievedReadConfessions}(
                sender_id,
                crush_id,
                confession_id,
                confession,
                time,
                status,
                anonymous_id,
                last_update,  
            )`,
        [
          confessionModel.senderId,
          confessionModel.crushId,
          confessionModel.confessionId,
          confessionModel.confession,
          confessionModel.time,
          confessionModel.status,
          confessionModel.senderAnonymousId,
          confessionModel.lastUpdate,
        ],
      );
      // Update the status of confession in sent_confessions table
      this.client.execute(
        `UPDATE ${CassandraTableNames.sentConfessions} SET status = ?, last_update = ? WHERE 
            ${CassandraMethods.getSentConfessionsKey().PARTITION_KEY} = ? AND
            ${CassandraMethods.getSentConfessionsKey().FIRST_SORTING_KEY} = ? AND,
            ${CassandraMethods.getSentConfessionsKey().SECOND_SORTING_KEY} = ?`,
        [
          confessionModel.status,
          confessionModel.lastUpdate,
          confessionModel.senderId,
          confessionModel.time,
          confessionModel.confessionId,
        ],
      );
    } catch (e: any) {
      console.log(e.toString());
    }
  };

  acceptOrRejectConfession = (updateStatus: UpdateConfessionStatus) => {
    this.client.execute(
      `UPDATE ${CassandraTableNames.recievedReadConfessions} SET status = ?, last_update = ? WHERE
        ${CassandraMethods.getRecievedReadConfessionsKey().PARTITION_KEY} = ? AND
        ${CassandraMethods.getRecievedReadConfessionsKey().FIRST_SORTING_KEY} = ? AND,
        ${CassandraMethods.getRecievedReadConfessionsKey().SECOND_SORTING_KEY} = ?`,
      [
        updateStatus.updatedStatus,
        updateStatus.updateTime,
        updateStatus.crushId,
        updateStatus.readingTime,
        updateStatus.confessionId,
      ],
    );
    this.client.execute(
      `UPDATE ${CassandraTableNames.sentConfessions} SET status = ?, last_update = ? WHERE
        ${CassandraMethods.getRecievedReadConfessionsKey().PARTITION_KEY} = ? AND
        ${CassandraMethods.getRecievedReadConfessionsKey().FIRST_SORTING_KEY} = ? AND,
        ${CassandraMethods.getRecievedReadConfessionsKey().SECOND_SORTING_KEY} = ?`,
      [
        updateStatus.updatedStatus,
        updateStatus.updateTime,
        updateStatus.senderId,
        updateStatus.sendingTime,
        updateStatus.confessionId,
      ],
    );
  };
}
