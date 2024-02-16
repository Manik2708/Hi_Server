import dotenv from 'dotenv';

dotenv.config();

const parseStringToNumber=(text:string|undefined):number|undefined=>{
  try{
   if(text==undefined){
     return undefined;
   }
   return parseInt(text);
  }catch(e){
   return undefined;
  }
 }

export const DatabaseUrl: string =
  'mongodb+srv://' +
  encodeURIComponent(process.env.DATABASE_USERNAME!) +
  ':' +
  encodeURIComponent(process.env.DATABASE_PASSWORD!) +
  '@cluster0.m5ofsm1.mongodb.net/?retryWrites=true&w=majority';
export const IP: string = process.env.IP_ADDRESS!;
export const FirebasePath: string = process.env.FIREBASE_PATH!;
export const NodemailerSenderEmail: string =
  process.env.NODEMAILER_SENDER_EMAIL!;
export const NodemailerSenderPassword: string =
  process.env.NODEMAILER_SENDER_PASSWORD!;
export const NodemailerService: string = process.env.NODEMAILER_SPMTP_SERVICE!;
export const IfRunningOnDocker = process.env.RUNNING_ON_DOCKER!;
export const MongoTestingLink = process.env.MONGO_TESTING_LINK!;
export const RedisTestingLink: string|undefined = process.env.TESTING_REDIS_LINK;
export const TestingCassandraContactPoint: string|undefined = process.env.TESTING_CASSANDRA_CONTACT_POINT;
export const TestingCassandraPort: number|undefined = parseStringToNumber(process.env.TESTING_CASSANDRA_PORT);
export const TestingRabbitLink: string|undefined = process.env.TESTING_RABBIT_LINK;
