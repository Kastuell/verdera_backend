import { Prisma } from '@prisma/client';
import { IsNumber, IsString } from 'class-validator';

export class LectionDto implements Prisma.LectionUpdateInput {
  @IsString()
  name: string;

  @IsString()
  source: string;

  @IsNumber()
  courseChapterId: number;
}
