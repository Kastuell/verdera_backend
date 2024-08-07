import { Prisma } from '@prisma/client';
import { IsNumber, IsString } from 'class-validator';

export class AnswerDto implements Prisma.AnswerUpdateInput {
  @IsString()
  value: string;

  @IsString()
  type: string;

  @IsNumber()
  questionId: number;

  @IsNumber()
  questionCorrectId: number;
}
