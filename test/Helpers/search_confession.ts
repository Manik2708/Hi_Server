import { types } from 'cassandra-driver';
import { TestServiceContainers } from './test_service_containers';
import { CassandraTableNames } from '../../package/constants/src/cassandra_constants';

export const getSearchedConfession = async (
  confessionId: string,
  partitionKey: string,
  time: Date,
  tableName: string,
): Promise<types.ResultSet> => {
  const result =
    await TestServiceContainers.getTestingCassandraClient().execute(
      `SELECT * FROM ${tableName} 
    WHERE sender_id = ? AND
    sending_time = ? AND
    confession_id = ? ALLOW FILTERING
    `,
      [partitionKey, time, confessionId],
      { prepare: true },
    );
  return result;
};
export const getSearchedReadConfession = async (
  confessionId: string,
  crushId: string,
  time: Date,
): Promise<types.ResultSet> => {
  const result =
    await TestServiceContainers.getTestingCassandraClient().execute(
      `SELECT * FROM ${CassandraTableNames.recievedReadConfessions} 
    WHERE crush_id = ? AND
    reading_time = ? AND
    confession_id = ? ALLOW FILTERING
    `,
      [crushId, time, confessionId],
      { prepare: true },
    );
  return result;
};
