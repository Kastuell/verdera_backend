import { Prisma } from '@prisma/client';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

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

export class AnswerSmartDto {
  @IsNumber()
  id: number;

  @IsArray()
  answers: [];
}
