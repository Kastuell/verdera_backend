import { Module } from '@nestjs/common';
import { CourseService } from 'src/course/course.service';
import { CourseChapterService } from 'src/course_chapter/course_chapter.service';
import { LectionService } from 'src/lection/lection.service';
import { LocalFileService } from 'src/local_file/local_file.service';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { BotService } from './bot.service';
import { GetLectionScene } from './scenes/student/get-lections.scene';
import { BotMainUpdate } from './updates/main.update';
import { BotStudentUpdate } from './updates/student.update';

@Module({
  providers: [
    BotService,
    BotMainUpdate,
    UserService,
    PrismaService,
    LocalFileService,
    BotStudentUpdate,
    GetLectionScene,
    LectionService,
    CourseChapterService,
    CourseService,
  ],
})
export class BotModule {}
