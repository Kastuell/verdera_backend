import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EnumUserRoles } from '@prisma/client';
import { hash } from 'argon2';
import { AuthRegisterDto } from 'src/auth/dto/auth.dto';
import { LocalFileDto } from 'src/local_file/dto/localFile.dto';
import { LocalFileService } from 'src/local_file/local_file.service';
import { PrismaService } from 'src/prisma.service';
import { UserUpdateDto } from './dto/user.dto';
import { returnUserObject } from './return-user.object';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => LocalFileService))
    private readonly localFileService: LocalFileService,
  ) {}

  async getByChatId(chatId: string | number) {
    const user = await this.prisma.user.findMany({
      where: {
        tg_id: chatId.toString(),
      },
      select: {
        ...returnUserObject,
        boughtCourses: {
          select: {
            course: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    return user[0];
  }

  async addTgId(tgId: string, userId: number) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        tg_id: tgId,
      },
      select: {
        ...returnUserObject,
      },
    });

    const { password, ...res } = user;

    return res;
  }

  async getByPhoneNumber(phoneNumber: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        phone: phoneNumber,
      },
      select: {
        ...returnUserObject,
      },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    return user;
  }

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

  async addAvatar(userId: number, dto: LocalFileDto) {
    const avatar = await this.localFileService.saveLocalFileData(dto);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatarId: avatar.id,
      },
    });
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

  async createCompleteCourses(userId: number, courseId: number) {
    const completeCourse = await this.prisma.completeCourses.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId,
        },
      },
    });
    if (!completeCourse) {
      return await this.prisma.completeCourses.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          course: {
            connect: {
              id: courseId,
            },
          },
        },
      });
    }
  }

  async create(dto: AuthRegisterDto) {
    const { password, ...rest } = dto;

    const user = await this.prisma.user.create({
      data: {
        password: await hash(password),
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
