import { Module } from '@nestjs/common';
import { CourseService } from 'src/course/course.service';
import { CourseChapterService } from 'src/course_chapter/course_chapter.service';
import { LectionService } from 'src/lection/lection.service';
import { PrismaService } from 'src/prisma.service';
import { QuestionService } from 'src/question/question.service';
import { UserService } from 'src/user/user.service';
import { CourseTestController } from './course_test.controller';
import { CourseTestService } from './course_test.service';

@Module({
  controllers: [CourseTestController],
  providers: [
    LectionService,
    PrismaService,
    CourseService,
    CourseTestService,
    CourseChapterService,
    QuestionService,
    UserService
  ],
})
export class CourseTestModule {}
