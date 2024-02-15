import mongoose from 'mongoose';
import { MongoTestingLink } from '../../src/enviornment_variables';

export async function createMongoInstance(): Promise<typeof mongoose> {
  const dbName: string = 'HI_SERVER_TEST_DATABASE';
  return mongoose.connect(MongoTestingLink, {
    dbName,
  });
}
export async function dropAllCollectionsFromDatabase(
  mongooseInstance: typeof mongoose,
): Promise<void> {
  const collections = await mongooseInstance.connection.db.collections();

  for (const collection of collections) {
    await collection.drop();
  }
}

export async function dropDatabase(
  mongooseInstance: typeof mongoose,
): Promise<void> {
  await mongooseInstance.connection.db.dropDatabase();
}

export async function disconnect(
  mongooseInstance: typeof mongoose,
): Promise<void> {
  await mongooseInstance.connection.close();
}
