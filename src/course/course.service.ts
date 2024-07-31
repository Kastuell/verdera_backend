import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import translit from 'src/utils/generate-slug';
import { CourseDto } from './dto/course.dto';
import { returnCourseObject } from './return-course.object';

@Injectable()
export class CourseService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async getAll() {
    const course = await this.prisma.course.findMany({
      select: {
        ...returnCourseObject,
      },
    });

    if (!course) throw new NotFoundException(`Курсы не найдены`);

    return course;
  }

  async getById(id: number) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: id,
      },
      select: {
        ...returnCourseObject,
      },
    });

    if (!course)
      throw new NotFoundException(`Курс под номером "${id}" не найден`);

    return course;
  }

  async getBySlug(slug: string) {
    const course = await this.prisma.course.findUnique({
      where: {
        slug: slug,
      },
      select: {
        ...returnCourseObject,
      },
    });

    if (!course)
      throw new NotFoundException(`Курс под значением "${slug}" не найден`);

    return course;
  }

  async create(dto: CourseDto) {
    const { description, name, productId } = dto;

    const course = await this.prisma.course.create({
      data: {
        name,
        slug: translit(name),
        description,
        product: {
          connect: {
            id: productId,
          },
        },
      },
    });

    return course;
  }

  async update(id: number, dto: CourseDto) {
    const { description, name, productId } = dto;

    const oldCourse = this.getById(id);

    if (oldCourse)
      throw new NotFoundException(`Курс под номером ${id} не найден`);

    const course = await this.prisma.course.update({
      where: {
        id: id,
      },
      data: {
        name,
        slug: translit(name),
        description,
        product: {
          connect: {
            id: productId,
          },
        },
      },
    });

    return course;
  }

  async delete(id: number) {
    const oldCourse = this.getById(id);

    if (oldCourse)
      throw new NotFoundException(`Глава под номером ${id} не найдена`);

    const course = await this.prisma.course.delete({
      where: {
        id: id,
      },
    });

    return course;
  }
}
