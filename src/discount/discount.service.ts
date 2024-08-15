import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { DiscountDto } from './dto/discount.dto';

@Injectable()
export class DiscountService {
  constructor(private prisma: PrismaService) {}

  async create(dto: DiscountDto) {
    const discount = await this.prisma.discount.create({
      data: {
        email: dto.email,
      },
    });

    return discount;
  }

  async getAll() {
    const discounts = await this.prisma.discount.findMany({});

    return discounts;
  }

  async getByEmail(dto: DiscountDto) {
    const discount = await this.prisma.discount.findMany({
      where: {
        email: dto.email,
      },
    });

    return discount;
  }
}
