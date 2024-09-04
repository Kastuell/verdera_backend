import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CourseService } from 'src/course/course.service';
import { CourseChapterService } from 'src/course_chapter/course_chapter.service';
import { LocalFileService } from 'src/local_file/local_file.service';
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
    LocalFileService,
    ConfigService
  ],
})
export class LectionModule {}
