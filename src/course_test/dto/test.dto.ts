import { Prisma } from '@prisma/client';
import { IsArray, IsNumber, IsString } from 'class-validator';

export class TestDto implements Prisma.TestUpdateInput {
  @IsString()
  name: string;

  @IsNumber()
  courseChapterId: number;
}

export class CheckTestDto {
  @IsNumber()
  testId: number
  
  @IsArray()
  userTest: { questId: number; answerId: number }[];
}
