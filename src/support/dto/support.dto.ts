import { Prisma } from '@prisma/client';
import { IsString } from 'class-validator';

export class SupportDto implements Prisma.SupportUpdateInput {
  // @IsString()
  // name: string;

  // @IsString()
  // messenger: string;

  @IsString()
  description: string;

  // @IsString()
  // phone: string;
}
