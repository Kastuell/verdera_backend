import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CourseTestController } from './course_test.controller';
import { CourseTestService } from './course_test.service';

@Module({
  controllers: [CourseTestController],
  providers: [CourseTestService, PrismaService],
})
export class CourseTestModule {}
