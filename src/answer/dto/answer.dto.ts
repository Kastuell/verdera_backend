import { Prisma } from '@prisma/client';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AnswerDto implements Prisma.AnswerUpdateInput {
  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  type: string;

  @IsNumber()
  questionId: number;

  @IsOptional()
  @IsNumber()
  questionCorrectId: number;
}
