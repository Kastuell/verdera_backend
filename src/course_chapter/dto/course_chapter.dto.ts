import { Prisma } from '@prisma/client';
import { IsNumber, IsString } from 'class-validator';

export class CourseChapterDto implements Prisma.CourseChapterUpdateInput {
  @IsString()
  name: string;

  @IsNumber()
  courseId: number;
}
