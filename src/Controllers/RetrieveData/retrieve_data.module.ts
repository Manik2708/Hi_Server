import { Module } from '@nestjs/common';
import { RetrieveDataController } from './retrieve_data';
import { RetrieveDataServices } from './Services/retrieve_data_services';
import { GlobalServiceModule } from '../../Services/global.service.module';

@Module({
  controllers: [RetrieveDataController],
  providers: [RetrieveDataServices],
  imports: [GlobalServiceModule],
})
export class RetrieveDataModule {}
