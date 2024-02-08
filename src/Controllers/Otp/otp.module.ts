import { Module } from '@nestjs/common';
import { OTPServices } from './Services/otp_services';
import { OTPController } from './otp_controllers';

@Module({
  providers: [OTPServices],
  controllers: [OTPController],
})
export class OTPModule {}
