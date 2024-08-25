import { Module } from '@nestjs/common';
import { CourseService } from 'src/course/course.service';
import { CourseTestService } from 'src/course_test/course_test.service';
import { LectionService } from 'src/lection/lection.service';
import { PrismaService } from 'src/prisma.service';
import { QuestionService } from 'src/question/question.service';
import { CourseChapterController } from './course_chapter.controller';
import { CourseChapterService } from './course_chapter.service';

@Module({
  controllers: [CourseChapterController],
  providers: [CourseChapterService, PrismaService, CourseService, CourseTestService, QuestionService, LectionService],
})
export class CourseChapterModule {}
