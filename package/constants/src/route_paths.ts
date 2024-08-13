export class UserRoutes {
  static CREATE_ACCOUNT_WITHOUT_VERIFICATION: string =
    'create-account-without-verification';
  static LOGIN: string = 'login';
  static CHANGE_EMAIL: string = 'change-email';
  static SET_USER_ONLINE: string = 'set-user-online';
}

export class ConfessionRoutes {
  static SEND_CONFESSION: string = 'send-confession';
  static REJECT_CONFESSION: string = 'reject-confession';
  static READ_CONFESSION: string = 'read-confession';
  static ACCEPT_CONFESSION: string = 'accept-confession';
}

export class OTPRoutes {
  static SEND_OTP: string = 'send-otp';
  static VERIFY_OTP: string = 'verify-otp';
}

export class ChatRoutes {
  static SEND_CHAT_MESSAGE: string = 'send-chat-messsage';
  static UPDATE_STATUS_OF_CHAT_MESSAGES: string =
    'update-status-of-chat-messages';
  static DELETE_CHAT_MESSAGES_FOR_ME: string = 'delete-chat-messages-for-me';
  static DELETE_CHAT_MESSAGE_FOR_EVERYONE: string =
    'delete-chat-message-for-everyone';
}

export class RetrieveDataRoutes {
  static RETRIEVE_CHATS_FOR_SENDER: string = 'retrieve-chats-for-sender';
  static RETRIEVE_CHATS_FOR_CRUSH: string = 'retrieve-chats-for-crush';
  static GET_CONFESSIONS_BY_CRUSH_ID: string = 'get-confessions-by-crush-id';
  static GET_READ_CONFESSIONS_BY_CRUSH_ID: string =
    'get-unread-confessions-by-crush-id';
  static RETRIEVE_DATA_FOR_OFFLINE_USER: string =
    'retrieve-data-for-offline-user';
}
