export class CassandraTableNames {
  static sentConfessions: string = 'hi_database.sent_confessions';
  static recievedUnreadConfessions: string =
    'hi_database.recieved_unread_confessions';
  static recievedReadConfessions: string =
    'hi_database.recieved_read_confessions';
  static chatsForSender: string = 'hi_database.chats_for_sender';
  static chatsForCrush: string = 'hi_database.chats_for_crush';
  static chatMessages: string = 'hi_database.chat_messages';
}

export interface CassandraKeys {
  PARTITION_KEY: string;
  FIRST_SORTING_KEY: string;
  SECOND_SORTING_KEY?: string;
}

export class CassandraMethods {
  static getSentConfessionsKey = (): CassandraKeys => {
    return {
      PARTITION_KEY: 'sender_id',
      FIRST_SORTING_KEY: 'sending_time',
      SECOND_SORTING_KEY: 'confession_id',
    };
  };
  static getRecievedUnreadConfessionsKey = (): CassandraKeys => {
    return {
      PARTITION_KEY: 'crush_id',
      FIRST_SORTING_KEY: 'sending_time',
      SECOND_SORTING_KEY: 'confession_id',
    };
  };
  static getRecievedReadConfessionsKey = (): CassandraKeys => {
    return {
      PARTITION_KEY: 'crush_id',
      FIRST_SORTING_KEY: 'reading_time',
      SECOND_SORTING_KEY: 'confession_id',
    };
  };
}
