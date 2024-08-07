import { Prisma } from '@prisma/client';
import { IsNumber, IsString } from 'class-validator';

export class TestDto implements Prisma.TestUpdateInput {
  @IsString()
  name: string;

  @IsNumber()
  courseChapterId: number;
}
