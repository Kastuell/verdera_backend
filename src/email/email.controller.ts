import { Body, Controller, Param, Post } from '@nestjs/common';
import { EmailDto } from './dto/send_email.dto';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  async sendEmail(@Body() dto: EmailDto) {
    return this.emailService.sendEmail(dto);
  }

  @Post('resend/:email')
  async resendConfirm(@Param('email') email: string) {
    return this, this.emailService.resendConfirm(email);
  }
}
