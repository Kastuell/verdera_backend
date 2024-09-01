import { Prisma } from '@prisma/client';
import { IsString } from 'class-validator';

export class SupportDto implements Prisma.SupportUpdateInput {
  @IsString()
  description: string;
}

export class SupportDtoUnAuth implements Prisma.SupportUpdateInput {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  phone: string;

  @IsString()
  messenger: string;
}
