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
import { ChatModel } from '../../Models/chat_model';
import { ChatMessageModel } from '../../Models/chat_message_model';
import {
  DeleteMessageModel,
  UpdateStatusOfChatMessageModel,
} from '../../Models/update_status_of_chat_message';
import { ConflictError, ConflictErrorTypes } from '../../Errors/conflict_error';
import { CassandraQueryHelper } from './query_helper';
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

      // // This method uses that keyspace to perform queries
      // await this.client.execute(`USE hi_database`);

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
            sending_time TIMESTAMP,
            status TEXT,
            crush_name TEXT,
            reading_time TIMESTAMP,
            reaction_time TIMESTAMP,
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
            sending_time TIMESTAMP,
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
            sending_time TIMESTAMP,
            status TEXT,
            anonymous_id TEXT,
            reading_time TIMESTAMP,
            reaction_time TIMESTAMP,
            PRIMARY KEY (crush_id, reading_time, confession_id)
            );`,
      );

      await this.client.execute(
        `CREATE TABLE IF NOT EXISTS ${CassandraTableNames.chatsForSender}(
          chat_id timeuuid,
          crush_name TEXT,
          crush_id TEXT,
          user_id TEXT,
          confession_id timeuuid,
          last_update TIMESTAMP,
          PRIMARY KEY (user_id, last_update, chat_id)
          );`,
      );

      await this.client.execute(
        `CREATE TABLE IF NOT EXISTS ${CassandraTableNames.chatsForCrush}(
            chat_id timeuuid,
            crush_id TEXT,
            user_id TEXT,
            anonymous_id TEXT,
            confession_id timeuuid,
            last_update TIMESTAMP,
            PRIMARY KEY (crush_id, last_update, chat_id)
            );`,
      );

      await this.client.execute(
        `CREATE TABLE IF NOT EXISTS ${CassandraTableNames.chatMessages}(
              chat_id timeuuid,
              message_id timeuuid,
              sending_time TIMESTAMP,
              delievery_time TIMESTAMP,
              reading_time TIMESTAMP,
              sender_id TEXT,
              reciever_id TEXT,
              message TEXT,
              status TEXT,
              owner_id TEXT,
              PRIMARY KEY ((owner_id, chat_id), sending_time, message_id)
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
          confessionModel.sender_id,
          confessionModel.crush_id,
          confessionModel.confession_id,
          confessionModel.confession,
          confessionModel.sending_time.toString(),
          confessionModel.status,
          confessionModel.crush_name,
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
          confessionModel.sender_id,
          confessionModel.crush_id,
          confessionModel.confession_id,
          confessionModel.confession,
          confessionModel.sending_time.toString(),
          confessionModel.status,
          confessionModel.sender_anonymous_id,
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
      const status = 'READ';
      // Firstly confession is removed from recieved_unread_confession
      const { PARTITION_KEY, FIRST_SORTING_KEY, SECOND_SORTING_KEY } =
        CassandraMethods.getRecievedUnreadConfessionsKey();
      await this.client.execute(
        `DELETE FROM ${CassandraTableNames.recievedUnreadConfessions} WHERE ${PARTITION_KEY} = ? AND ${FIRST_SORTING_KEY} = ? AND ${SECOND_SORTING_KEY} = ?`,
        [
          confessionModel.crush_id,
          confessionModel.sending_time,
          confessionModel.confession_id,
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
          confessionModel.sender_id,
          confessionModel.crush_id,
          confessionModel.confession_id,
          confessionModel.confession,
          confessionModel.sending_time,
          status,
          confessionModel.sender_anonymous_id,
          confessionModel.reading_time,
          null,
        ],
      );
      // Update the status of confession in sent_confessions table
      await this.client.execute(
        `UPDATE ${CassandraTableNames.sentConfessions} SET status = ?, reading_time = ? WHERE 
            sender_id = ? AND
            sending_time = ? AND
            confession_id = ?
            `,
        [
          status,
          confessionModel.reading_time,
          confessionModel.sender_id,
          confessionModel.sending_time,
          confessionModel.confession_id,
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
   * @param updateStatus UpdateConfessionStatusModel
   */

  acceptOrRejectConfession = async (updateStatus: UpdateConfessionStatus) => {
    const whetherStatusIsRead = await this.client.execute(
      `
    SELECT status FROM ${CassandraTableNames.sentConfessions} WHERE
    ${CassandraMethods.getSentConfessionsKey().PARTITION_KEY} = ? AND
        ${CassandraMethods.getSentConfessionsKey().FIRST_SORTING_KEY} = ? AND
        ${CassandraMethods.getSentConfessionsKey().SECOND_SORTING_KEY} = ?`,
      [
        updateStatus.sender_id,
        updateStatus.sending_time,
        updateStatus.confession_id,
      ],
    );
    if (whetherStatusIsRead.rows[0].get(`status`) != `READ`) {
      throw new ConflictError(
        ConflictErrorTypes.UNREAD_CONFESSION_STATUS_CHANGE_REQUEST,
      );
    }
    const readConfession = await this.client.execute(
      `
        SELECT confession_id FROM ${CassandraTableNames.recievedReadConfessions} WHERE
        ${CassandraMethods.getRecievedReadConfessionsKey().PARTITION_KEY} = ? AND
        ${CassandraMethods.getRecievedReadConfessionsKey().FIRST_SORTING_KEY} = ? AND
        ${CassandraMethods.getRecievedReadConfessionsKey().SECOND_SORTING_KEY} = ?`,
      [
        updateStatus.crush_id,
        updateStatus.reading_time,
        updateStatus.confession_id,
      ],
    );
    if (readConfession.rowLength == 0) {
      throw new ConflictError(ConflictErrorTypes.NO_CONFESSION_FOUND);
    }
    await this.client.execute(
      `UPDATE ${CassandraTableNames.recievedReadConfessions} SET status = ?, reaction_time = ? WHERE
        ${CassandraMethods.getRecievedReadConfessionsKey().PARTITION_KEY} = ? AND
        ${CassandraMethods.getRecievedReadConfessionsKey().FIRST_SORTING_KEY} = ? AND
        ${CassandraMethods.getRecievedReadConfessionsKey().SECOND_SORTING_KEY} = ?`,
      [
        updateStatus.updated_status,
        updateStatus.update_time,
        updateStatus.crush_id,
        updateStatus.reading_time,
        updateStatus.confession_id,
      ],
    );
    await this.client.execute(
      `UPDATE ${CassandraTableNames.sentConfessions} SET status = ?, reaction_time = ? WHERE
        ${CassandraMethods.getSentConfessionsKey().PARTITION_KEY} = ? AND
        ${CassandraMethods.getSentConfessionsKey().FIRST_SORTING_KEY} = ? AND
        ${CassandraMethods.getSentConfessionsKey().SECOND_SORTING_KEY} = ?`,
      [
        updateStatus.updated_status,
        updateStatus.update_time,
        updateStatus.sender_id,
        updateStatus.sending_time,
        updateStatus.confession_id,
      ],
    );
  };

  createChat = async (chatModel: ChatModel) => {
    await this.client.execute(
      `INSERT INTO ${CassandraTableNames.chatsForSender} (
        chat_id,
        crush_name,
        crush_id,
        user_id,
        confession_id,
        last_update
      ) VALUES(?,?,?,?,?,?)`,
      [
        chatModel.chat_id,
        chatModel.crush_name,
        chatModel.crush_id,
        chatModel.user_id,
        chatModel.confession_id,
        chatModel.last_update.toISOString(),
      ],
      {
        prepare: true,
      },
    );

    await this.client.execute(
      `INSERT INTO ${CassandraTableNames.chatsForCrush} (
        chat_id,
        crush_id,
        user_id,
        anonymous_id,
        confession_id,
        last_update
      ) VALUES(?,?,?,?,?,?)`,
      [
        chatModel.chat_id,
        chatModel.crush_id,
        chatModel.user_id,
        chatModel.anonymous_id,
        chatModel.confession_id,
        chatModel.last_update.toISOString(),
      ],
      {
        prepare: true,
      },
    );
  };
  saveChatMessage = async (chatMessageModel: ChatMessageModel) => {
    await this.client.execute(
      `INSERT INTO ${CassandraTableNames.chatMessages} (
        chat_id,
        message_id,
        sending_time,
        delievery_time,
        reading_time,
        sender_id,
        reciever_id,
        message,
        status,
        owner_id
        ) VALUES(?,?,?,?,?,?,?,?,?,?)`,
      [
        chatMessageModel.chat_id,
        chatMessageModel.message_id,
        chatMessageModel.sending_time.toISOString(),
        chatMessageModel.delievery_time == null
          ? null
          : chatMessageModel.delievery_time.toISOString(),
        chatMessageModel.reading_time == null
          ? null
          : chatMessageModel.reading_time.toISOString(),
        chatMessageModel.sender_id,
        chatMessageModel.reciever_id,
        chatMessageModel.message,
        chatMessageModel.status,
        chatMessageModel.sender_id,
      ],
      {
        prepare: true,
      },
    );
    await this.client.execute(
      `INSERT INTO ${CassandraTableNames.chatMessages} (
        chat_id,
        message_id,
        sending_time,
        delievery_time,
        reading_time,
        sender_id,
        reciever_id,
        message,
        status,
        owner_id
        ) VALUES(?,?,?,?,?,?,?,?,?,?)`,
      [
        chatMessageModel.chat_id,
        chatMessageModel.message_id,
        chatMessageModel.sending_time.toISOString(),
        chatMessageModel.delievery_time == null
          ? null
          : chatMessageModel.delievery_time.toISOString(),
        chatMessageModel.reading_time == null
          ? null
          : chatMessageModel.reading_time.toISOString(),
        chatMessageModel.sender_id,
        chatMessageModel.reciever_id,
        chatMessageModel.message,
        chatMessageModel.status,
        chatMessageModel.reciever_id,
      ],
      {
        prepare: true,
      },
    );
  };
  readMultipleChatMessages = async (
    updateStatusOfChatMessage: UpdateStatusOfChatMessageModel[],
  ) => {
    // Here owner will be the requester and sender_id corresponds to id of sender of message.
    const helper = new CassandraQueryHelper();
    if (!helper.ifEveryMessageHaveSameChatId(updateStatusOfChatMessage)) {
      throw new ConflictError(
        ConflictErrorTypes.ALL_MESSAGES_SHOULD_HAVE_SAME_CHAT_ID,
      );
    }
    await this.client.batch([]);
    await this.client.execute(
      `BEGIN BATCH
      ${helper.getMultipleUpdateQueriesForReadingMessages(updateStatusOfChatMessage.length)}
      APPLY BATCH`,
      helper.getParametersForReadingMessages(updateStatusOfChatMessage),
    );
    await this.client.execute(
      `BEGIN BATCH
      ${helper.getMultipleUpdateQueriesForReadingMessages(updateStatusOfChatMessage.length)}
      APPLY BATCH`,
      helper.getParametersForReadingMessagesForSender(
        updateStatusOfChatMessage,
      ),
    );
  };
  updateDelieveredMessage = async (
    updateStatusOfChatMessage: UpdateStatusOfChatMessageModel,
  ) => {
    await this.client.execute(
      `UPDATE ${CassandraTableNames.chatMessages} status = ?, delievery_time = ? WHERE
        owner_id = ? AND
        chat_id = ? AND
        sending_time = ? AND
        message_id = ?`,
      [
        updateStatusOfChatMessage.status,
        updateStatusOfChatMessage.update_time.toString(),
        updateStatusOfChatMessage.owner_id,
        updateStatusOfChatMessage.chat_id,
        updateStatusOfChatMessage.sending_time.toString(),
        updateStatusOfChatMessage.message_id,
      ],
    );
  };
  updateMultipleDelieveredMessages = async (
    updateStatusOfChatMessage: UpdateStatusOfChatMessageModel[],
  ) => {
    const helper = new CassandraQueryHelper();
    if (!helper.ifEveryMessageHaveSameChatId(updateStatusOfChatMessage)) {
      throw new ConflictError(
        ConflictErrorTypes.ALL_MESSAGES_SHOULD_HAVE_SAME_CHAT_ID,
      );
    }
    await this.client.execute(
      `BEGIN BATCH
      ${helper.getMultipleUpdateQueriesForDelieveredMessages(updateStatusOfChatMessage.length)}
      APPLY BATCH`,
      helper.getParametersForReadingMessages(updateStatusOfChatMessage),
    );
  };
  deleteChatMessageForMe = async (deleteMessage: DeleteMessageModel[]) => {
    const helper = new CassandraQueryHelper();
    if (!helper.ifEveryMessageHaveSameChatId(deleteMessage)) {
      throw new ConflictError(
        ConflictErrorTypes.ALL_MESSAGES_SHOULD_HAVE_SAME_CHAT_ID,
      );
    }
    await this.client.execute(
      `BEGIN BATCH
       ${helper.getMultipleQueriesForDeletingMessages(deleteMessage.length)}
       APPLY BATCH`,
      helper.getParametersForDeletingMessages(deleteMessage),
    );
  };
  deleteChatMessageForEveryone = async (deleteMessage: DeleteMessageModel) => {
    await this.client.execute(
      `DELETE FROM ${CassandraTableNames.chatMessages} WHERE
      owner_id = ? AND
      chat_id = ? AND
      sending_time = ? AND
      message_id = ?`,
      [
        deleteMessage.requester_id,
        deleteMessage.chat_id,
        deleteMessage.sending_time,
        deleteMessage.message_id,
      ],
    );
    await this.client.execute(
      `DELETE FROM ${CassandraTableNames.chatMessages} WHERE
      owner_id = ? AND
      chat_id = ? AND
      sending_time = ? AND
      message_id = ?`,
      [
        deleteMessage.reciever_id,
        deleteMessage.chat_id,
        deleteMessage.sending_time,
        deleteMessage.message_id,
      ],
    );
  };
}
