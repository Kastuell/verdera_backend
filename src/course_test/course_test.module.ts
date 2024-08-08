import { Module } from '@nestjs/common';
import { CourseService } from 'src/course/course.service';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { CourseTestController } from './course_test.controller';
import { CourseTestService } from './course_test.service';

@Module({
  controllers: [CourseTestController],
  providers: [CourseTestService, PrismaService, UserService, CourseService],
})
export class CourseTestModule {}
