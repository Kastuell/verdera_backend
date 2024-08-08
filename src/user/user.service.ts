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

  async createCompleteCourses(
    userId: number,
    courseId: number,
    progress: number[],
  ) {
    const completeCourse = await this.prisma.completeCourses.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId,
        },
      },
    });
    if (completeCourse == null) {
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
          progress: progress,
        },
      });
    } else {
      return await this.prisma.completeCourses.update({
        where: {
          userId_courseId: {
            userId: completeCourse.userId,
            courseId: completeCourse.courseId,
          },
        },
        data: {
          progress: [
            progress[0],
            completeCourse.progress[1] + progress[1],
          ],
        },
      });
    }
  }

  async createCompleteTest(userId: number, testId: number) {
    return await this.prisma.completeTest.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        test: {
          connect: {
            id: testId,
          },
        },
      },
    });
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
