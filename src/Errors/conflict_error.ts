import { HttpException, HttpStatus } from '@nestjs/common';

export class ConflictError extends HttpException {
  constructor(reqType: ConflictErrorTypes) {
    let message: string;
    switch (reqType) {
      case ConflictErrorTypes.MORE_THAN_ONE_USER_EXISTS_WITH_SAME_ID:
        message = 'More than one user exists with the same primary key';
        break;
      case ConflictErrorTypes.MESSAGE_CANT_HAVE_SAME_SENDER_AND_RECIEVER_ID:
        message = "Chat Message can't have same sender and reciever id";
        break;
      case ConflictErrorTypes.ALL_MESSAGES_SHOULD_HAVE_SAME_CHAT_ID:
        message =
          'All chat messages which are needy of update should have same chat id';
        break;
      default:
        message = 'Unknown Conflict Error';
        break;
    }
    super(
      {
        message: message,
      },
      HttpStatus.CONFLICT,
    );
  }
}

export enum ConflictErrorTypes {
  MORE_THAN_ONE_USER_EXISTS_WITH_SAME_ID,
  MESSAGE_CANT_HAVE_SAME_SENDER_AND_RECIEVER_ID,
  ALL_MESSAGES_SHOULD_HAVE_SAME_CHAT_ID,
}
