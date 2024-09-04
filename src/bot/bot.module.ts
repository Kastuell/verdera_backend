import { Module } from '@nestjs/common';
import { LocalFileService } from 'src/local_file/local_file.service';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { BotService } from './bot.service';
import { BotStudentUpdate } from './updates/student.update';
import { BotMainUpdate} from './updates/main.update';
import { GetLectionScene } from './scenes/student/get-lections.scene';

@Module({
  providers: [BotService, BotMainUpdate, UserService, PrismaService, LocalFileService, BotStudentUpdate, GetLectionScene],
})
export class BotModule {}
