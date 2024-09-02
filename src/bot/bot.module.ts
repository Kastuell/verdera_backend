import { Module } from '@nestjs/common';
import { LocalFileService } from 'src/local_file/local_file.service';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';

@Module({
  providers: [BotService, BotUpdate, UserService, PrismaService, LocalFileService],
})
export class BotModule {}
