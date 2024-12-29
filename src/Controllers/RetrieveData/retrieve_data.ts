import { Controller, Get, Req, Res } from '@nestjs/common';
import express from 'express';
import { ControllerPaths } from '../../Constants/contoller_paths';
import { CassandraDatabaseQueries } from '../../Database/Cassandra/queries';
import { RetrieveDataRoutes } from '../../Constants/route_paths';
import { ThrowError } from '../../Errors/throw_error';
import { CassandraTableNames } from '../../Constants/cassandra_constants';
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

  @Get(RetrieveDataRoutes.RETRIEVE_CHATS_FOR_SENDER)
  async retrieveChatsForSender(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      const user_id = req.id;
      const client = this.cassandraObject.getClient();
      const queryHelper = new CassandraQueryHelper();
      const senderStream = client.stream(
        `SELECT * FROM ${CassandraTableNames.chatsForSender} WHERE user_id = ?`,
        [user_id],
        { prepare: true },
      );
      senderStream.on('readable', function () {
        let row;
        while ((row = this.read())) {
          const chat_retrieved: ChatModelForSender =
            queryHelper.parseChatForSenderFromCassandraRow(row);
          res.write(JSON.stringify(chat_retrieved), (err) => {
            if (err) {
              throw new InternalServerError(err.message);
            }
          });
        }
      });
      senderStream.on('end', async function () {
        res.end();
      });
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
      const client = this.cassandraObject.getClient();
      const queryHelper = new CassandraQueryHelper();
      const senderStream = client.stream(
        `SELECT * FROM ${CassandraTableNames.chatsForCrush} WHERE crush_id = ?`,
        [user_id],
        { prepare: true },
      );
      senderStream.on('readable', function () {
        let row;
        while ((row = this.read())) {
          const chat_retrieved: ChatModelForCrush =
            queryHelper.parseChatForCrushFromCassandraRow(row);
          res.write(JSON.stringify(chat_retrieved), (err) => {
            if (err) {
              throw new InternalServerError(err.message);
            }
          });
        }
      });
      senderStream.on('end', async () => {
        res.end();
      });
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
        (_, row) => {
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
  retrieveDataForOfflineUser(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      const user_id = req.id;
      this.retrieveDataServices.retrieveDataForOfflineUsers(user_id!).pipe(res);
    } catch (error) {
      throw new ThrowError(error, res);
    }
  }
}
