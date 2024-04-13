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
            anonymous_user_id TEXT,
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
              deleted_by_sender BOOLEAN,
              deleted_by_reciever BOOLEAN,
              PRIMARY KEY (chat_id, sending_time, message_id)
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
          confessionModel.sendingTime.toString(),
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
          confessionModel.sendingTime.toString(),
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
      const status = 'READ';
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
          status,
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
            confession_id = ?
            `,
        [
          status,
          confessionModel.readingTime,
          confessionModel.senderId,
          confessionModel.sendingTime,
          confessionModel.confessionId,
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
    await this.client.execute(
      `UPDATE ${CassandraTableNames.recievedReadConfessions} SET status = ?, reaction_time = ? WHERE
        ${CassandraMethods.getRecievedReadConfessionsKey().PARTITION_KEY} = ? AND
        ${CassandraMethods.getRecievedReadConfessionsKey().FIRST_SORTING_KEY} = ? AND
        ${CassandraMethods.getRecievedReadConfessionsKey().SECOND_SORTING_KEY} = ?`,
      [
        updateStatus.updatedStatus,
        updateStatus.updateTime.toString(),
        updateStatus.crushId,
        updateStatus.readingTime.toString(),
        updateStatus.confessionId,
      ],
    );
    await this.client.execute(
      `UPDATE ${CassandraTableNames.sentConfessions} SET status = ?, reaction_time = ? WHERE
        ${CassandraMethods.getRecievedReadConfessionsKey().PARTITION_KEY} = ? AND
        ${CassandraMethods.getRecievedReadConfessionsKey().FIRST_SORTING_KEY} = ? AND
        ${CassandraMethods.getRecievedReadConfessionsKey().SECOND_SORTING_KEY} = ?`,
      [
        updateStatus.updatedStatus,
        updateStatus.updateTime.toString(),
        updateStatus.senderId,
        updateStatus.sendingTime.toString(),
        updateStatus.confessionId,
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
        chatModel.chatId,
        chatModel.crushName,
        chatModel.crushId,
        chatModel.userId,
        chatModel.confessionId,
        chatModel.lastUpdate.toString(),
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
        anonymous_user_id,
        confession_id,
        last_update,
      ) VALUES(?,?,?,?,?,?)`,
      [
        chatModel.chatId,
        chatModel.crushId,
        chatModel.userId,
        chatModel.anonymousUserId,
        chatModel.confessionId,
        chatModel.lastUpdate.toString(),
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
        deleted_by_sender,
        deleted_by_reciever,
        VALUES(?,?,?,?,?,?,?,?,?,?,?)
      )`,
      [
        chatMessageModel.chatId,
        chatMessageModel.messageId,
        chatMessageModel.sendingTime.toString(),
        chatMessageModel.delieveryTime == null
          ? null
          : chatMessageModel.delieveryTime.toString(),
        chatMessageModel.readingTime == null
          ? null
          : chatMessageModel.readingTime.toString(),
        chatMessageModel.senderId,
        chatMessageModel.recieverId,
        chatMessageModel.message,
        chatMessageModel.status,
        chatMessageModel.deletedBySender,
        chatMessageModel.deletedByReciever,
      ],
      {
        prepare: true,
      },
    );
  };
  readChatMessage = async (
    updateStatusOfChatMessage: UpdateStatusOfChatMessageModel,
  ) => {
    await this.client.execute(
      `UPDATE ${CassandraTableNames.chatMessages} status = ?, reading_time = ? WHERE
          chat_id = ? AND
          sending_time = ? AND
          message_id = ?`,
      [
        updateStatusOfChatMessage.status,
        updateStatusOfChatMessage.updateTime.toString(),
        updateStatusOfChatMessage.chatId,
        updateStatusOfChatMessage.sendingTime.toString(),
        updateStatusOfChatMessage.messageId,
      ],
    );
  };
  readMultipleChatMessages = async (
    updateStatusOfChatMessage: UpdateStatusOfChatMessageModel[],
  ) => {
    const helper = new CassandraQueryHelper();
    if (!helper.ifEveryMessageHaveSameChatId(updateStatusOfChatMessage)) {
      throw new ConflictError(
        ConflictErrorTypes.ALL_MESSAGES_SHOULD_HAVE_SAME_CHAT_ID,
      );
    }
    await this.client.execute(
      `
      BEGIN BATCH
      ${helper.getMultipleUpdateQueriesForReadingMessages(updateStatusOfChatMessage.length)}
      APPLY BATCH`,
      helper.getParametersForReadingMessages(updateStatusOfChatMessage),
    );
  };
  updateDelieveredMessage = async (
    updateStatusOfChatMessage: UpdateStatusOfChatMessageModel,
  ) => {
    await this.client.execute(
      `UPDATE ${CassandraTableNames.chatMessages} status = ?, delievery_time = ? WHERE
        chat_id = ? AND
        sending_time = ? AND
        message_id = ?`,
      [
        updateStatusOfChatMessage.status,
        updateStatusOfChatMessage.updateTime.toString(),
        updateStatusOfChatMessage.chatId,
        updateStatusOfChatMessage.sendingTime.toString(),
        updateStatusOfChatMessage.messageId,
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
  deleteChatMessageForMe = async (deleteMessage: DeleteMessageModel) => {
    let deletedBySender = false;
    let deletedByReciever = false;
    const statusOfRequester = await this.client.execute(
      `SELECT sender_id, reciever_id, deleted_by_sender, deleted_by_reciever ${CassandraTableNames.chatMessages} WHERE
      chat_id = ? AND
      sending_time = ? AND
      message_id = ?`,
      [
        deleteMessage.chatId,
        deleteMessage.sendingTime.toString(),
        deleteMessage.messageId,
      ],
    );
    if (statusOfRequester.rowLength != 1) {
      throw new ConflictError(
        ConflictErrorTypes.MORE_THAN_ONE_USER_EXISTS_WITH_SAME_ID,
      );
    }
    if (
      statusOfRequester.rows[0].get('sender_id') == deleteMessage.requesterId &&
      statusOfRequester.rows[0].get('reciever_id') == deleteMessage.requesterId
    ) {
      throw new ConflictError(
        ConflictErrorTypes.MESSAGE_CANT_HAVE_SAME_SENDER_AND_RECIEVER_ID,
      );
    } else if (
      statusOfRequester.rows[0].get('sender_id') == deleteMessage.requesterId
    ) {
      await this.client.execute(
        `UPDATE ${CassandraTableNames.chatMessages} deleted_by_sender = ? WHERE
        chat_id = ? AND
        sending_time = ? AND
        message_id = ?`,
        [
          true,
          deleteMessage.chatId,
          deleteMessage.sendingTime,
          deleteMessage.messageId,
        ],
      );
      deletedBySender = true;
    } else if (
      statusOfRequester.rows[0].get('reciever_id') == deleteMessage.requesterId
    ) {
      await this.client.execute(
        `UPDATE ${CassandraTableNames.chatMessages} deleted_by_reciever = ? WHERE
        chat_id = ? AND
        sending_time = ? AND
        message_id = ?`,
        [
          true,
          deleteMessage.chatId,
          deleteMessage.sendingTime,
          deleteMessage.messageId,
        ],
      );
      deletedByReciever = true;
    }
    if (
      (deletedBySender &&
        statusOfRequester.rows[0].get('deleted_by_reciever')) ||
      (deletedByReciever && statusOfRequester.rows[0].get('deleted_by_sender'))
    ) {
      await this.deleteChatMessageForEveryone(deleteMessage);
    }
  };
  deleteChatMessageForEveryone = async (deleteMessage: DeleteMessageModel) => {
    await this.client.execute(
      `DELETE ${CassandraTableNames.chatMessages} WHERE
      chat_id = ? AND
      sending_time = ? AND
      message_id = ?`,
      [
        deleteMessage.chatId,
        deleteMessage.sendingTime.toString(),
        deleteMessage.messageId,
      ],
    );
  };
}
