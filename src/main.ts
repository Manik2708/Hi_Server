import mongoose from 'mongoose';
import { createClient } from 'redis';
import { DatabaseUrl } from './enviornment_variables';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

const typeClient = createClient();
export type RedisClientType = typeof typeClient;

async function bootstrap() {
  const Db = DatabaseUrl;
  mongoose
    .connect(Db)
    .then(() => {
      console.log('Connected to Database');
    })
    .catch((e) => console.log(e.message));
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(3000);
}

bootstrap();
