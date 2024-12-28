import { Controller, Inject, Post, Req, Res } from '@nestjs/common';
import express from 'express';
import { ControllerPaths } from '../../Constants/contoller_paths';
import { ChatMessageForUserService } from './Services/send_chat_message_service';
import { ChatRoutes } from '../../Constants/route_paths';
import { ThrowError } from '../../Errors/throw_error';
import { types } from 'cassandra-driver';
import { InjectionTokens } from '../../Constants/injection_tokens';
import { CreateQueue } from '../../Queues/base';
import { QueueNames } from '../../Constants/queues_redis';
import { ConflictError, ConflictErrorTypes } from '../../Errors/conflict_error';

@Controller(ControllerPaths.CHATS_CONTROLLER)
export class ChatsController {
  constructor(
    private readonly chatMessageService: ChatMessageForUserService,
  ) {}

  @Post(ChatRoutes.SEND_CHAT_MESSAGE)
  async sendChatMessage(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      const {
        chat_id,
        sender_id,
        reciever_id,
        message,
        sending_time,
        status,
        referred_by,
      } = req.body;
      await this.chatMessageService.sendChatMessage(
        types.TimeUuid.now(),
        chat_id,
        sender_id,
        reciever_id,
        message,
        sending_time,
        status,
        referred_by,
      );
    } catch (error) {
      throw new ThrowError(error, res);
    }
  }

  @Post(ChatRoutes.DELETE_CHAT_MESSAGES_FOR_ME)
  async deleteChatMessagesForMe(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      const { delete_message_model } = req.body;
      if (delete_message_model.length > 50) {
        throw new ConflictError(ConflictErrorTypes.BATCH_LIMIT_EXCEED);
      }
      await this.chatMessageService.deleteChatMessageForMe(
        delete_message_model,
      );
    } catch (error) {
      throw new ThrowError(error, res);
    }
  }

  @Post(ChatRoutes.DELETE_CHAT_MESSAGE_FOR_EVERYONE)
  async deleteChatMessageForEveryone(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      const { delete_message_model } = req.body;
      await this.chatMessageService.deleteChatMessageForEveryOne(
        delete_message_model,
      );
    } catch (error) {
      throw new ThrowError(error, res);
    }
  }

  @Post(ChatRoutes.UPDATE_STATUS_OF_CHAT_MESSAGES)
  async updateStatusOfChatMessages(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      const {
        reciever_id,
        update_status_of_chat_message_model,
        updated_status,
      } = req.body;
      if (update_status_of_chat_message_model.length > 50) {
        throw new ConflictError(ConflictErrorTypes.BATCH_LIMIT_EXCEED);
      }
      this.chatMessageService.updateStatusOfChatMessages(
        reciever_id,
        update_status_of_chat_message_model,
        updated_status,
      );
      return res.status(200).json(true);
    } catch (error) {
      throw new ThrowError(error, res);
    }
  }
}
