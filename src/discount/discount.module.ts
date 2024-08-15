import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { DiscountController } from './discount.controller';
import { DiscountService } from './discount.service';

@Module({
  controllers: [DiscountController],
  providers: [DiscountService, PrismaService],
})
export class DiscountModule {}
