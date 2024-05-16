import { Controller, Get, Req, Res } from '@nestjs/common';
import express from 'express';
import { ControllerPaths } from '../../Constants/contoller_paths';
import { CassandraDatabaseQueries } from '../../Database/Cassandra/queries';
import { RetrieveDataRoutes } from '../../Constants/route_paths';
import { ThrowError } from '../../Errors/throw_error';
import { CassandraTableNames } from '../../Constants/cassandra_constants';
import { types } from 'cassandra-driver';
import { ChatModelForCrush, ChatModelForSender } from '../../Models/chat_model';
import { CassandraQueryHelper } from '../../Database/Cassandra/query_helper';
import { InternalServerError } from '../../Errors/server_error';
import { ConfessionModel } from '../../Models/confession';
import { RetrieveConfessionsByCrushId } from '../../Models/retrieve_data';
import { RetrieveDataServices } from './Services/retrieve_data_services';

@Controller(ControllerPaths.RETRIEVE_DATA_CONTROLLER)
export class RetrieveDataController {
  constructor(
    private readonly cassandraObject: CassandraDatabaseQueries,
    private readonly retrieveDataServices: RetrieveDataServices,
  ) {}

  @Get(RetrieveDataRoutes.retrieveDataAfterLogin)
  async retrieveDataAfterLogin(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      return new Promise((resolve, reject) => {
        const user_id = req.id;
        const queryHelper = new CassandraQueryHelper();
        this.cassandraObject
          .getClient()
          .stream(
            `SELECT * FROM ${CassandraTableNames.chatsForSender} WHERE sender_id = ?`,
            [user_id],
            {
              prepare: true,
            },
          )
          .on(`readable`, (chats_row: types.Row) => {
            const chat_retrieved: ChatModelForSender =
              queryHelper.parseChatForSenderFromCassandraRow(chats_row);
            const chat_id = chats_row.get('chat_id');
            this.cassandraObject
              .getClient()
              .stream(
                `SELECT * FROM ${CassandraTableNames.chatMessages} WHERE owner_id = ? AND chat_id = ?`,
                [user_id, chat_id],
                {
                  prepare: true,
                },
              )
              .on(`readable`, (chat_message_row: types.Row) => {
                chat_retrieved.messages.push(
                  queryHelper.parseChatMessageFromCassandraRow(
                    chat_message_row,
                  ),
                );
              })
              .on(`end`, () => {
                res.write(chat_retrieved);
              });
          })
          .on(`end`, () => {
            this.cassandraObject
              .getClient()
              .stream(
                `SELECT * FROM ${CassandraTableNames.chatsForCrush} WHERE crush_id = ?`,
                [user_id],
                {
                  prepare: true,
                },
              )
              .on(`readable`, (chats_row: types.Row) => {
                const chat_retrieved: ChatModelForCrush =
                  queryHelper.parseChatForCrushFromCassandraRow(chats_row);
                const chat_id = chats_row.get('chat_id');
                this.cassandraObject
                  .getClient()
                  .stream(
                    `SELECT * FROM ${CassandraTableNames.chatMessages} WHERE owner_id = ? AND chat_id = ?`,
                    [user_id, chat_id],
                    {
                      prepare: true,
                    },
                  )
                  .on(`readable`, (chat_message_row: types.Row) => {
                    chat_retrieved.messages.push(
                      queryHelper.parseChatMessageFromCassandraRow(
                        chat_message_row,
                      ),
                    );
                  })
                  .on(`end`, () => {
                    res.write(chat_retrieved);
                  });
              })
              .on(`end`, () => {
                res.end();
                resolve;
              });
          });
      });
    } catch (error) {
      throw new ThrowError(error, res);
    }
  }

  @Get(RetrieveDataRoutes.getUnreadConfessionsByCrushId)
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

  @Get(RetrieveDataRoutes.getReadConfessionsByCrushId)
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
  @Get(RetrieveDataRoutes.retrieveDataForOfflineUser)
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
}
