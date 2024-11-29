import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PromoService {
  constructor(private prisma: PrismaService) {}

  async getByName(name: string) {
    if (typeof name == 'string') {
      const promo = await this.prisma.promo.findUnique({
        where: {
          name: name.toLowerCase(),
        },
      });
      return promo;
    }
  }

  async create(dto: { name: string; value: number }) {
    const old_promo = await this.prisma.promo.findUnique({
      where: {
        name: dto.name.toLowerCase(),
      },
    });

    if (old_promo) throw new BadRequestException('Такой промокод уже есть!');

    const promo = await this.prisma.promo.create({
      data: {
        name: dto.name.toLowerCase(),
        value: dto.value,
      },
    });

    return promo;
  }
}
