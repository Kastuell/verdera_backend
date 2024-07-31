import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EnumUserRoles } from '@prisma/client';
import { hash } from 'argon2';
import { AuthRegisterDto } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma.service';
import { UserUpdateDto } from './dto/user.dto';
import { returnUserObject } from './return-user.object';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const users = await this.prisma.user.findMany({
      select: {
        ...returnUserObject,
      },
    });

    if (!users) throw new NotFoundException(`Пользователи не найдены`);

    return users;
  }

  async getById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        ...returnUserObject,
      },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    return user;
  }

  async getByEmail(email: string) {
    if (email === undefined)
      throw new BadRequestException('Предоставьте почту');
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        ...returnUserObject,
      },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    return user;
  }

  async checkEmail(email: string) {
    if (email === undefined)
      throw new BadRequestException('Предоставьте почту');
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        ...returnUserObject,
      },
    });

    if (user) return 'Почта занята';

    return 'Почта свободна';
  }

  async create(dto: AuthRegisterDto) {
    const { password, ...rest } = dto;

    const user = await this.prisma.user.create({
      data: {
        password: await hash(password),
        avatar: '',
        role: EnumUserRoles.USER,
        active: true,
        ...rest,
      },
    });

    const { password: pass, ...res } = user;

    return res;
  }

  async update(id: number, dto: UserUpdateDto) {
    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
      select: {
        ...returnUserObject,
      },
    });

    const { password, ...res } = user;

    return res;
  }
}
