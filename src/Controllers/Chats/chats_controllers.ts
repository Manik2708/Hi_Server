import { Controller, Post, Req, Res } from '@nestjs/common';
import express from 'express';
import { ControllerPaths } from '../../Constants/contoller_paths';
import { ChatMessageForUserService } from './Services/send_chat_message_service';
import { ChatRoutes } from '../../Constants/route_paths';
import { ThrowError } from '../../Errors/throw_error';
import { types } from 'cassandra-driver';

@Controller(ControllerPaths.CHATS_CONTROLLER)
export class ChatsController {
  constructor(private readonly chatMessageService: ChatMessageForUserService) {}

  @Post(ChatRoutes.SEND_CHAT_MESSAGE)
  async sendChatMessage(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      const {
        chatId,
        senderId,
        recieverId,
        message,
        sendingTime,
        status,
        referredBy,
      } = req.body;
      await this.chatMessageService.sendChatMessage(
        types.TimeUuid.now(),
        chatId,
        senderId,
        recieverId,
        message,
        sendingTime,
        status,
        referredBy,
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
      const { deleteMessagesModel } = req.body;
      await this.chatMessageService.deleteChatMessageForMe(deleteMessagesModel);
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
      const { deleteMessageModel } = req.body;
      await this.chatMessageService.deleteChatMessageForEveryOne(
        deleteMessageModel,
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
      const { crushId, updateStatusOfChatMessageModel, updatedStatus } =
        req.body;
      await this.chatMessageService.updateStatusOfChatMessages(
        crushId,
        updateStatusOfChatMessageModel,
        updatedStatus,
      );
    } catch (error) {
      throw new ThrowError(error, res);
    }
  }
}
