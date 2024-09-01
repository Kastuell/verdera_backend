import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { SupportDto, SupportDtoUnAuth } from './dto/support.dto';

@Injectable()
export class SupportService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async getAll() {
    const supports = await this.prisma.support.findMany({});

    if (!supports) throw new NotFoundException('Not found');
  }

  async create(dto: SupportDto, userId: number) {
    const user = await this.userService.getById(userId);
    const support = await this.prisma.support.create({
      data: {
        ...dto,
        messenger: user.social,
        name: user.name,
        phone: user.phone,
        user: {
          connect: { id: userId },
        },
      },
    });

    return support;
  }

  async createUnAuth(dto: SupportDtoUnAuth) {
    const support = await this.prisma.support.create({
      data: {
        ...dto,
      },
    });

    return support;
  }
}