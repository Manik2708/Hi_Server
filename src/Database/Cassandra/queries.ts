import { Client } from 'cassandra-driver';
import { ConfessionModel } from '../../Models/confession';
import {
  CassandraMethods,
  CassandraTableNames,
} from '../../Constants/cassandra_constants';
import { UpdateConfessionStatus } from '../../Models/update_status_of_confession';
import { Inject, Injectable, OnModuleInit, Scope } from '@nestjs/common';
import { InjectionTokens } from '../../Constants/injection_tokens';
import { InternalServerError } from '../../Errors/server_error';
@Injectable({ scope: Scope.DEFAULT })
export class CassandraDatabaseQueries implements OnModuleInit {
  private client: Client;
  constructor(@Inject(InjectionTokens.CasClient) client: Client) {
    this.client = client;
  }

  getClient = (): Client => this.client;

  async onModuleInit() {
    await this.connectAndCreateTables();
  }

  connectAndCreateTables = async (): Promise<void> => {
    try {
      await this.client.connect();

      // This method creates a keyspace in which our all of the data will be stored
      await this.client.execute(`
    CREATE KEYSPACE IF NOT EXISTS hi_database
    WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
    `);

      // This method uses that keyspace to perform queries
      await this.client.execute(`USE hi_database`);

      /**
       * Create Table for saving confession for sender in Database
       * @param sender_id: The id of user who is sending confession
       * @param crush_id: The id of user to which confession is sent
       * @param confession_id: The id of confession which will make primary key unique
       * @param confession: The message
       * @param time: Time of sending confession
       * @param status: Sent, Recieved, Accepted, Rejected
       * @param crush_name: The name which will be displayed to the sender client
       */

      await this.client.execute(
        `CREATE TABLE IF NOT EXISTS ${CassandraTableNames.sentConfessions}(
            sender_id TEXT,
            crush_id TEXT,
            confession_id timeuuid,
            confession TEXT,
            sending_time TEXT,
            status TEXT,
            crush_name TEXT,
            reading_time TEXT,
            reaction_time TEXT,
            PRIMARY KEY (sender_id, sending_time, confession_id)
            );`,
      );

      /**
       * Create Table for saving unread confessions for reciever in Database
       * @param sender_id: The id of user who is sending confession
       * @param crush_id: The id of user to which confession is sent
       * @param confession_id: The id of confession which will make primary key unique
       * @param confession: The message
       * @param time: Time of sending confession
       * @param status: Sent, Recieved, Accepted, Rejected
       * @param crush_name: The name which will be displayed to the sender client
       * @param anonymous_id: The name which will be displayed to the reciever client
       */

      await this.client.execute(
        `CREATE TABLE IF NOT EXISTS ${CassandraTableNames.recievedUnreadConfessions}(
            sender_id TEXT,
            crush_id TEXT,
            confession_id timeuuid,
            confession TEXT,
            sending_time TEXT,
            status TEXT,
            anonymous_id TEXT,
            PRIMARY KEY (crush_id, sending_time, confession_id)
            );`,
      );

      /**
       * Create Table for saving read confessions for reciever in Database
       * @param sender_id: The id of user who is sending confession
       * @param crush_id: The id of user to which confession is sent
       * @param confession_id: The id of confession which will make primary key unique
       * @param confession: The message
       * @param time: Time of sending confession
       * @param status: Sent, Recieved, Accepted, Rejected
       * @param anonymous_id: The name which will be displayed to the reciever client
       * @param last_update: The time of reading confession
       */

      await this.client.execute(
        `CREATE TABLE IF NOT EXISTS ${CassandraTableNames.recievedReadConfessions}(
            sender_id TEXT,
            crush_id TEXT,
            confession_id timeuuid,
            confession TEXT,
            sending_time TEXT,
            status TEXT,
            anonymous_id TEXT,
            reading_time TEXT,
            reaction_time TEXT,
            PRIMARY KEY (crush_id, reading_time, confession_id)
            );`,
      );
    } catch (e: any) {
      console.log(e.toString());
    }
  };

  /**
   * @param confessionModel
   */

  saveConfessionToCassandra = async (confessionModel: ConfessionModel) => {
    try {
      // This function saves confession for saving it for sender
      await this.client.execute(
        `INSERT INTO ${CassandraTableNames.sentConfessions}(
            sender_id,
            crush_id,
            confession_id,
            confession,
            sending_time,
            status,
            crush_name,
            reading_time,
            reaction_time 
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          confessionModel.senderId,
          confessionModel.crushId,
          confessionModel.confessionId,
          confessionModel.confession,
          confessionModel.sendingTime,
          confessionModel.status,
          confessionModel.crushName,
          null,
          null,
        ],
        {
          prepare: true,
        },
      );
      // This method saves confession for saving it for reviever
      await this.client.execute(
        `INSERT INTO ${CassandraTableNames.recievedUnreadConfessions}(
            sender_id,
            crush_id,
            confession_id,
            confession,
            sending_time,
            status,
            anonymous_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          confessionModel.senderId,
          confessionModel.crushId,
          confessionModel.confessionId,
          confessionModel.confession,
          confessionModel.sendingTime,
          confessionModel.status,
          confessionModel.senderAnonymousId,
        ],
        {
          prepare: true,
        },
      );
    } catch (e: any) {
      throw new InternalServerError(e.toString());
    }
  };

  /**
   * This method marks confession as read and remove from unread category
   * @param confessionModel
   */

  readConfession = async (confessionModel: ConfessionModel): Promise<void> => {
    try {
      console.log('here');
      // Firstly confession is removed from recieved_unread_confession
      const { PARTITION_KEY, FIRST_SORTING_KEY, SECOND_SORTING_KEY } =
        CassandraMethods.getRecievedUnreadConfessionsKey();
      await this.client.execute(
        `DELETE FROM ${CassandraTableNames.recievedUnreadConfessions} WHERE ${PARTITION_KEY} = ? AND ${FIRST_SORTING_KEY} = ? AND ${SECOND_SORTING_KEY} = ?`,
        [
          confessionModel.crushId,
          confessionModel.sendingTime,
          confessionModel.confessionId,
        ],
      );
      // Add this confession to recieved_read_confession
      await this.client.execute(
        `INSERT INTO ${CassandraTableNames.recievedReadConfessions}(
            sender_id,
            crush_id,
            confession_id,
            confession,
            sending_time,
            status,
            anonymous_id,
            reading_time,
            reaction_time
            ) VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          confessionModel.senderId,
          confessionModel.crushId,
          confessionModel.confessionId,
          confessionModel.confession,
          confessionModel.sendingTime,
          confessionModel.status,
          confessionModel.senderAnonymousId,
          confessionModel.readingTime,
          null,
        ],
      );
      // Update the status of confession in sent_confessions table
      await this.client.execute(
        `UPDATE ${CassandraTableNames.sentConfessions} SET status = ?, reading_time = ? WHERE 
            sender_id = ? AND
            sending_time = ? AND
            confession_id = ?`,
        [
          confessionModel.status,
          confessionModel.readingTime,
          confessionModel.senderId,
          confessionModel.sendingTime,
          confessionModel.confessionId,
        ],
      );
    } catch (e: any) {
      throw new InternalServerError(e.toString());
    }
  };

  /**
   * @param updateStatus UpdateConfessionStatusModel
   */

  acceptOrRejectConfession = (updateStatus: UpdateConfessionStatus) => {
    this.client.execute(
      `UPDATE ${CassandraTableNames.recievedReadConfessions} SET status = ?, reaction_time = ? WHERE
        ${CassandraMethods.getRecievedReadConfessionsKey().PARTITION_KEY} = ? AND
        ${CassandraMethods.getRecievedReadConfessionsKey().FIRST_SORTING_KEY} = ? AND
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
      `UPDATE ${CassandraTableNames.sentConfessions} SET status = ?, reaction_time = ? WHERE
        ${CassandraMethods.getRecievedReadConfessionsKey().PARTITION_KEY} = ? AND
        ${CassandraMethods.getRecievedReadConfessionsKey().FIRST_SORTING_KEY} = ? AND
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
