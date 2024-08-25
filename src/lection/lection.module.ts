import { Module } from '@nestjs/common';
import { CourseService } from 'src/course/course.service';
import { CourseChapterService } from 'src/course_chapter/course_chapter.service';
import { PrismaService } from 'src/prisma.service';
import { LectionController } from './lection.controller';
import { LectionService } from './lection.service';

@Module({
  controllers: [LectionController],
  providers: [
    LectionService,
    PrismaService,
    CourseChapterService,
    CourseService,
  ],
})
export class LectionModule {}
