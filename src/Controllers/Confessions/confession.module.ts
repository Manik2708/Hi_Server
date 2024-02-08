import { Module } from '@nestjs/common';
import { ConfessionsController } from './confession_controller';
import { ConfessionServices } from './Services/confession_services';

@Module({
  controllers: [ConfessionsController],
  providers: [ConfessionServices],
})
export class ConfessionsModule {}
