import { CassandraTableNames } from '../../src/Constants/cassandra_constants';
import { TestServiceContainers } from './test_service_containers';
import { types } from 'cassandra-driver';

export const searchChatAmongSender = async (
  senderId: string,
  lastUpdate: Date,
  chatId: string,
): Promise<types.ResultSet> => {
  const client = TestServiceContainers.getTestingCassandraClient();
  return client.execute(
    `SELECT * FROM hi_database.${CassandraTableNames.chatsForSender} WHERE user_id = ? AND last_update = ? AND chat_id=? ALLOW FILTERING`,
    [senderId, lastUpdate, chatId],
  );
};

export const searchChatAmongCrush = async (
  crushId: string,
  lastUpdate: Date,
  chatId: string,
): Promise<types.ResultSet> => {
  const client = TestServiceContainers.getTestingCassandraClient();
  return client.execute(
    `SELECT * FROM hi_database.${CassandraTableNames.chatsForCrush} WHERE crush_id = ? AND last_update = ? AND chat_id = ? ALLOW FILTERING`,
    [crushId, lastUpdate, chatId],
  );
};
