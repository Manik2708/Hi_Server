export class CassandraTableNames {
  static sentConfessions: string = 'sent_confessions';
  static recievedUnreadConfessions: string = 'recieved_unread_confessions';
  static recievedReadConfessions: string = 'recieved_read_confessions';
  static chatsForSender: string = 'chats_for_sender';
  static chatsForCrush: string = 'chats_for_crush';
  static chatMessages: string = 'chat_messages';
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
