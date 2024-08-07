import { Prisma } from '@prisma/client';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LectionDto implements Prisma.LectionUpdateInput {
  @IsString()
  name: string;

  @IsString()
  source: string;

  @IsArray()
  @IsNotEmpty()
  materials: string[];

  @IsNumber()
  courseChapterId: number;
}
