import { Module } from '@nestjs/common';
import { CourseService } from 'src/course/course.service';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { LectionController } from './lection.controller';
import { LectionService } from './lection.service';

@Module({
  controllers: [LectionController],
  providers: [LectionService, PrismaService, CourseService, UserService],
})
export class LectionModule {}
