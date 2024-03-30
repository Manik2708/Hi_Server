import { types } from 'cassandra-driver';
import { TestServiceContainers } from './test_service_containers';

export const getSearchedConfession = async (
  confessionId: string,
  partitionKey: string,
  time: Date,
  tableName: string,
): Promise<types.ResultSet> => {
  const result =
    await TestServiceContainers.getTestingCassandraClient().execute(
      `SELECT * FROM hi_database.${tableName} 
    WHERE sender_id = ? AND
    sending_time = ? AND
    confession_id = ?
    `,
      [partitionKey, time.toString(), confessionId],
      { prepare: true },
    );
  return result;
};
export const getSearchedReadConfession = async (
  confessionId: string,
  partitionKey: string,
  time: Date,
  tableName: string,
): Promise<types.ResultSet> => {
  const result =
    await TestServiceContainers.getTestingCassandraClient().execute(
      `SELECT * FROM hi_database.${tableName} 
    WHERE sender_id = ? AND
    reading_time = ? AND
    confession_id = ?
    `,
      [partitionKey, time.toString(), confessionId],
      { prepare: true },
    );
  return result;
};
