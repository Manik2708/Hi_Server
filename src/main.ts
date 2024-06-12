import mongoose from 'mongoose';
import { DatabaseUrl } from './enviornment_variables';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const Db = DatabaseUrl;
  mongoose
    .connect(Db)
    .then(() => {
      console.log('Connected to Database');
    })
    .catch((e) => console.log(e.message));
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
