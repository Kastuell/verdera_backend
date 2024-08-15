import { Prisma } from '@prisma/client';
import { IsString } from 'class-validator';

export class DiscountDto implements Prisma.DiscountUpdateInput {
  @IsString()
  email: string;
}
