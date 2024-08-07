import { Prisma } from '@prisma/client';
import { IsNumber, IsString } from 'class-validator';

export class QuestionDto implements Prisma.QuestionUpdateInput {
  @IsString()
  name: string;

  @IsNumber()
  testId: number;
}
