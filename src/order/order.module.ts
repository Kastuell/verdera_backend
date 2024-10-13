import { Module } from '@nestjs/common';
import { DiscountService } from 'src/discount/discount.service';
import { LocalFileService } from 'src/local_file/local_file.service';
import { PrismaService } from 'src/prisma.service';
import { PromoService } from 'src/promo/promo.service';
import { UserService } from 'src/user/user.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController],
  providers: [
    OrderService,
    PrismaService,
    UserService,
    LocalFileService,
    DiscountService,
    PromoService,
  ],
})
export class OrderModule {}
