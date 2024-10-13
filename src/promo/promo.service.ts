import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PromoService {
  constructor(private prisma: PrismaService) {}

  async getByName(name: string) {
    const promo = await this.prisma.promo.findUnique({
      where: {
        name: name,
      },
    });

    if (!promo) throw new NotFoundException('Такого промокода нет!');

    return promo;
  }

  async create(name: string) {
    const old_promo = await this.prisma.promo.findUnique({
      where: {
        name: name,
      },
    });

    if (old_promo) throw new BadRequestException('Такой промокод уже есть!');

    const promo = await this.prisma.promo.create({
      data: {
        name: name,
      },
    });

    return promo;
  }
}
