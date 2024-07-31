import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CourseChapterController } from './course_chapter.controller';
import { CourseChapterService } from './course_chapter.service';

@Module({
  controllers: [CourseChapterController],
  providers: [CourseChapterService, PrismaService],
})
export class CourseChapterModule {}
