import { Module } from '@nestjs/common';
import { ChatsController } from './chats_controllers';
import { ChatMessageForUserService } from './Services/send_chat_message_service';
import { GlobalServiceModule } from '../../Services/global.service.module';

@Module({
  controllers: [ChatsController],
  providers: [ChatMessageForUserService],
  imports: [GlobalServiceModule],
})
export class ChatsModule {}
