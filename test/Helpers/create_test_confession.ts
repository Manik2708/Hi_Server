import { nanoid } from 'nanoid';
import { CassandraTableNames } from '../../package/constants/src/cassandra_constants';
import { TestServiceContainers } from './test_service_containers';
import { types } from 'cassandra-driver';
import { ConfessionModel } from '../../package/database/src/Models/confession';

export const createTestConfession = async (
  senderId: string,
  crushId: string,
): Promise<ConfessionModel> => {
  const client = TestServiceContainers.getTestingCassandraClient();
  const confessionModel: ConfessionModel = {
    sender_id: senderId,
    crush_id: crushId,
    confession_id: types.TimeUuid.now().toString(),
    confession: nanoid().toLowerCase(),
    sending_time: new Date(),
    status: 'SENT',
    crush_name: nanoid().toLowerCase(),
    sender_anonymous_id: nanoid().toLowerCase(),
  };
  await client.execute(
    `INSERT INTO ${CassandraTableNames.sentConfessions}(
        sender_id,
        crush_id,
        confession_id,
        confession,
        sending_time,
        status,
        crush_name,
        reading_time,
        reaction_time 
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      confessionModel.sender_id,
      confessionModel.crush_id,
      confessionModel.confession_id,
      confessionModel.confession,
      confessionModel.sending_time,
      confessionModel.status,
      confessionModel.crush_name,
      null,
      null,
    ],
    {
      prepare: true,
    },
  );
  await client.execute(
    `INSERT INTO ${CassandraTableNames.recievedUnreadConfessions}(
            sender_id,
            crush_id,
            confession_id,
            confession,
            sending_time,
            status,
            anonymous_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      confessionModel.sender_id,
      confessionModel.crush_id,
      confessionModel.confession_id,
      confessionModel.confession,
      confessionModel.sending_time,
      confessionModel.status,
      confessionModel.sender_anonymous_id,
    ],
    {
      prepare: true,
    },
  );
  return confessionModel;
};

export const createTestReadConfession = async (
  senderId: string,
  crushId: string,
): Promise<ConfessionModel> => {
  const client = TestServiceContainers.getTestingCassandraClient();
  const confessionModel: ConfessionModel = {
    sender_id: senderId,
    crush_id: crushId,
    confession_id: types.TimeUuid.now().toString(),
    confession: nanoid().toLowerCase(),
    sending_time: new Date(),
    status: 'READ',
    crush_name: nanoid().toLowerCase(),
    sender_anonymous_id: nanoid().toLowerCase(),
    reading_time: new Date(),
  };
  await client.execute(
    `INSERT INTO ${CassandraTableNames.sentConfessions}(
        sender_id,
        crush_id,
        confession_id,
        confession,
        sending_time,
        status,
        crush_name,
        reading_time,
        reaction_time 
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      confessionModel.sender_id,
      confessionModel.crush_id,
      confessionModel.confession_id,
      confessionModel.confession,
      confessionModel.sending_time,
      confessionModel.status,
      confessionModel.crush_name,
      confessionModel.reading_time,
      null,
    ],
    {
      prepare: true,
    },
  );
  await client.execute(
    `INSERT INTO ${CassandraTableNames.recievedReadConfessions}(
        sender_id,
        crush_id,
        confession_id,
        confession,
        sending_time,
        status,
        anonymous_id,
        reading_time,
        reaction_time
        ) VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      confessionModel.sender_id,
      confessionModel.crush_id,
      confessionModel.confession_id,
      confessionModel.confession,
      confessionModel.sending_time,
      confessionModel.status,
      confessionModel.sender_anonymous_id,
      confessionModel.reading_time,
      null,
    ],
  );
  return confessionModel;
};
