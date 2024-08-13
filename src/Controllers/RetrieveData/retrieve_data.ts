import { Controller, Get, Req, Res } from '@nestjs/common';
import express from 'express';
import { ControllerPaths } from '../../../package/constants/src/contoller_paths';
import { CassandraDatabaseQueries } from '../../Database/Cassandra/queries';
import { RetrieveDataRoutes } from '../../../package/constants/src/route_paths';
import { ThrowError } from '../../../package/errors/src/throw_error';
import { CassandraTableNames } from '../../../package/constants/src/cassandra_constants';
import { ChatModelForCrush, ChatModelForSender } from '../../../package/database/src/Models/chat_model';
import { CassandraQueryHelper } from '../../Database/Cassandra/query_helper';
import { InternalServerError } from '../../../package/errors/src/server_error';
import { ConfessionModel } from '../../../package/database/src/Models/confession';
import {
  RetrieveConfessionsByCrushId,
  RetrieveDataAfterLoginModel,
} from '../../../package/database/src/Models/retrieve_data';
import { RetrieveDataServices } from './Services/retrieve_data_services';

@Controller(ControllerPaths.RETRIEVE_DATA_CONTROLLER)
export class RetrieveDataController {
  constructor(
    private readonly cassandraObject: CassandraDatabaseQueries,
    private readonly retrieveDataServices: RetrieveDataServices,
  ) {}

  @Get(RetrieveDataRoutes.RETRIEVE_CHATS_FOR_SENDER)
  async retrieveChatsForSender(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      const user_id = req.id;
      await this.senderStreamEnd(res, user_id!);
      res.end();
    } catch (error) {
      throw new ThrowError(error, res);
    }
  }

  @Get(RetrieveDataRoutes.RETRIEVE_CHATS_FOR_CRUSH)
  async retrieveChatsForCrush(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      const user_id = req.id;
      await this.crushStreamEnd(res, user_id!);
      res.end();
    } catch (error) {
      throw new ThrowError(error, res);
    }
  }

  @Get(RetrieveDataRoutes.GET_CONFESSIONS_BY_CRUSH_ID)
  async getUnreadConfessionsByCrushId(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      const crush_id = req.header('crush_id');
      let page_state: string | undefined = req.header('page_state');
      const confessions: ConfessionModel[] = [];
      const helper = new CassandraQueryHelper();
      this.cassandraObject.getClient().eachRow(
        `SELECT * FROM ${CassandraTableNames.recievedUnreadConfessions} WHERE crush_id =?`,
        [crush_id],
        {
          pageState: page_state,
          prepare: true,
          fetchSize: 50,
        },
        (n, row) => {
          confessions.push(helper.parseConfessionFromCassandraRow(row));
        },
        (error, result) => {
          if (error) {
            throw new InternalServerError(error.message);
          }
          page_state = result.pageState;
          const output_data: RetrieveConfessionsByCrushId = {
            page_state: page_state,
            confessions: confessions,
          };
          return res.status(200).json(output_data);
        },
      );
    } catch (error) {
      throw new ThrowError(error, res);
    }
  }

  @Get(RetrieveDataRoutes.GET_READ_CONFESSIONS_BY_CRUSH_ID)
  async getReadConfessionsByCrushId(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      const crush_id = req.header('crush_id');
      let page_state: string | undefined = req.header('page_state');
      const confessions: ConfessionModel[] = [];
      const helper = new CassandraQueryHelper();
      this.cassandraObject.getClient().eachRow(
        `SELECT * FROM ${CassandraTableNames.recievedReadConfessions} WHERE crush_id =?`,
        [crush_id],
        {
          pageState: page_state,
          prepare: true,
          fetchSize: 50,
        },
        (n, row) => {
          confessions.push(helper.parseConfessionFromCassandraRow(row));
        },
        (error, result) => {
          if (error) {
            throw new InternalServerError(error.message);
          }
          page_state = result.pageState;
          const output_data: RetrieveConfessionsByCrushId = {
            page_state: page_state,
            confessions: confessions,
          };
          return res.status(200).json(output_data);
        },
      );
    } catch (error) {
      throw new ThrowError(error, res);
    }
  }
  @Get(RetrieveDataRoutes.RETRIEVE_DATA_FOR_OFFLINE_USER)
  async retrieveDataForOfflineUser(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      const user_id = req.id;
      await this.retrieveDataServices.retrieveDataForOfflineUsers(user_id!);
      return res.status(200).json(true);
    } catch (error) {
      throw new ThrowError(error, res);
    }
  }
  private senderStreamEnd = async (res: express.Response, user_id: string) => {
    return new Promise<void>((resolve) => {
      const client = this.cassandraObject.getClient();
      const queryHelper = new CassandraQueryHelper();
      const senderStream = client.stream(
        `SELECT * FROM ${CassandraTableNames.chatsForSender} WHERE user_id = ?`,
        [user_id],
        { prepare: true },
      );
      const promises: Promise<void>[] = [];
      senderStream.on('readable', function () {
        let chats_row;
        while ((chats_row = this.read())) {
          const chat_retrieved: ChatModelForSender =
            queryHelper.parseChatForSenderFromCassandraRow(chats_row);
          const chat_id = chats_row.get('chat_id');

          const chatMessagesStream = client.stream(
            `SELECT * FROM ${CassandraTableNames.chatMessages} WHERE owner_id = ? AND chat_id = ?`,
            [user_id, chat_id],
            { prepare: true },
          );

          const chatMessagesPromise = new Promise<void>(
            (resolveChatMessages) => {
              chatMessagesStream.on('readable', function () {
                let chat_message_row;
                while ((chat_message_row = this.read())) {
                  chat_retrieved.messages.push(
                    queryHelper.parseChatMessageFromCassandraRow(
                      chat_message_row,
                    ),
                  );
                }
              });

              chatMessagesStream.on('end', () => {
                res.write(Buffer.from(JSON.stringify(chat_retrieved)));
                resolveChatMessages();
              });
            },
          );

          promises.push(chatMessagesPromise);
        }
      });

      senderStream.on('end', async function () {
        await Promise.all(promises);
        resolve();
      });
    });
  };
  private crushStreamEnd = async (res: express.Response, user_id: string) => {
    return new Promise<void>((resolve) => {
      const client = this.cassandraObject.getClient();
      const queryHelper = new CassandraQueryHelper();

      const senderStream = client.stream(
        `SELECT * FROM ${CassandraTableNames.chatsForCrush} WHERE crush_id = ?`,
        [user_id],
        { prepare: true },
      );

      const promises: Promise<void>[] = [];
      senderStream.on('readable', function () {
        let chats_row;
        while ((chats_row = this.read())) {
          const chat_retrieved: ChatModelForCrush =
            queryHelper.parseChatForCrushFromCassandraRow(chats_row);
          const chat_id = chats_row.get('chat_id');

          const chatMessagesStream = client.stream(
            `SELECT * FROM ${CassandraTableNames.chatMessages} WHERE owner_id = ? AND chat_id = ?`,
            [user_id, chat_id],
            { prepare: true },
          );
          const chatMessagesPromise = new Promise<void>(
            (resolveChatMessages) => {
              chatMessagesStream.on('readable', function () {
                let chat_message_row;
                while ((chat_message_row = this.read())) {
                  chat_retrieved.messages.push(
                    queryHelper.parseChatMessageFromCassandraRow(
                      chat_message_row,
                    ),
                  );
                }
              });

              chatMessagesStream.on('end', () => {
                res.write(Buffer.from(JSON.stringify(chat_retrieved)));
                resolveChatMessages();
              });
            },
          );

          promises.push(chatMessagesPromise);
        }
      });

      senderStream.on('end', async () => {
        await Promise.all(promises);
        resolve();
      });
    });
  };
}
