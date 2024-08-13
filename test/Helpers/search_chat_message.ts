import { types } from 'cassandra-driver';
import { TestServiceContainers } from './test_service_containers';
import { CassandraTableNames } from '../../package/constants/src/cassandra_constants';

export const searchChatMessage = async (
  owner_id: string,
  chat_id: string,
  sending_time: Date,
  message_id: string,
): Promise<types.ResultSet> => {
  const client = TestServiceContainers.getTestingCassandraClient();
  return client.execute(
    `SELECT * FROM ${CassandraTableNames.chatMessages} WHERE 
    owner_id = ? AND 
    chat_id = ? AND 
    sending_time = ? AND
    message_id = ? ALLOW FILTERING`,
    [owner_id, chat_id, sending_time, message_id],
    {
      prepare: true,
    },
  );
};
