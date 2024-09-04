import { Module } from '@nestjs/common';
import { BotService } from 'src/bot/bot.service';
import { LocalFileService } from 'src/local_file/local_file.service';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { BotMainUpdate } from 'src/bot/updates/main.update';

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService, PrismaService, UserService, LocalFileService, BotMainUpdate, BotService],
})
export class ScheduleModule {}
