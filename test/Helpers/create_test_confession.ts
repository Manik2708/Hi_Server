import { nanoid } from 'nanoid';
import { CassandraTableNames } from '../../src/Constants/cassandra_constants';
import { TestServiceContainers } from './test_service_containers';
import { types } from 'cassandra-driver';
import { ConfessionModel } from 'src/Models/confession';

export const createTestConfession = async (
  senderId: string,
  crushId: string,
): Promise<ConfessionModel> => {
  const client = TestServiceContainers.getTestingCassandraClient();
  const confessionModel: ConfessionModel = {
    senderId: senderId,
    crushId: crushId,
    confessionId: types.TimeUuid.now().toString(),
    confession: nanoid().toLowerCase(),
    sendingTime: new Date(),
    status: 'SENT',
    crushName: nanoid().toLowerCase(),
    senderAnonymousId: nanoid().toLowerCase(),
  };
  await client.execute(
    `INSERT INTO hi_database.${CassandraTableNames.sentConfessions}(
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
      confessionModel.senderId,
      confessionModel.crushId,
      confessionModel.confessionId,
      confessionModel.confession,
      confessionModel.sendingTime,
      confessionModel.status,
      confessionModel.crushName,
      null,
      null,
    ],
    {
      prepare: true,
    },
  );
  await client.execute(
    `INSERT INTO hi_database.${CassandraTableNames.recievedUnreadConfessions}(
            sender_id,
            crush_id,
            confession_id,
            confession,
            sending_time,
            status,
            anonymous_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      confessionModel.senderId,
      confessionModel.crushId,
      confessionModel.confessionId,
      confessionModel.confession,
      confessionModel.sendingTime,
      confessionModel.status,
      confessionModel.senderAnonymousId,
    ],
    {
      prepare: true,
    },
  );
  return confessionModel;
};
