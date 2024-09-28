import { Module } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { LocalFileService } from 'src/local_file/local_file.service';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';

@Module({
  controllers: [SupportController],
  providers: [SupportService, PrismaService, UserService, LocalFileService, EmailService],
})
export class SupportModule {}
