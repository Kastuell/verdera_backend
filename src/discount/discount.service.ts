import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { DiscountDto } from './dto/discount.dto';

@Injectable()
export class DiscountService {
  constructor(private prisma: PrismaService) {}

  async create(dto: DiscountDto) {
    const old_discount = await this.getByEmail(dto.email);

    if (old_discount)
      throw new BadRequestException('На данный номер уже есть скидка!');

    const discount = await this.prisma.discount.create({
      data: {
        email: dto.email,
      },
    });

    return discount;
  }

  async getAll() {
    const discounts = await this.prisma.discount.findMany({});

    if (!discounts) throw new NotFoundException('');

    return discounts;
  }

  async getByEmail(email: string) {
    const discount = await this.prisma.discount.findUnique({
      where: {
        email: email,
      },
    });

    return discount;
  }

  async getMyDiscount(email: string) {
    const discount = await this.prisma.discount.findUnique({
      where: {
        email: email,
      },
    });

    if (!discount) throw new NotFoundException('Скидка не найдена');

    return discount;
  }
}
