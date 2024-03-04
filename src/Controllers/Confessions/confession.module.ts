import { Module } from '@nestjs/common';
import { ConfessionsController } from './confession_controller';
import { ConfessionServices } from './Services/confession_services';
import { GlobalServiceModule } from '../../Services/global.service.module';

@Module({
  controllers: [ConfessionsController],
  providers: [ConfessionServices],
  imports: [GlobalServiceModule],
})
export class ConfessionsModule {}
