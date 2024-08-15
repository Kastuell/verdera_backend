import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseChapterService } from 'src/course_chapter/course_chapter.service';
import { PrismaService } from 'src/prisma.service';
import translit from 'src/utils/generate-slug';
import { CourseDto } from './dto/course.dto';
import { returnCourseObject } from './return-course.object';

@Injectable()
export class CourseService {
  constructor(
    private prisma: PrismaService,
    private courseChapterService: CourseChapterService,
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

  async getBoughtCoursesByUserId(userId: number) {
    const boughtCourses = await this.prisma.boughtCourses.findMany({
      where: {
        userId: userId,
      },
      select: {
        courseId: true,
      },
    });

    if (!boughtCourses)
      throw new NotFoundException('Купленные курсы не найдены');

    return boughtCourses;
  }


  async getMyCourses(userId: number) {
    const boughtCourses = await this.getBoughtCoursesByUserId(userId);

    const ids = boughtCourses.map((item) => item.courseId);

    const myCourses = await this.prisma.course.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        ...returnCourseObject,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return myCourses;
  }

  async getById(id: number) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: id,
      },
      select: {
        ...returnCourseObject,
        chapters: {
          select: {
            lection: {
              select: {
                id: true,
              },
            },
            test: {
              select: {
                id: true,
              },
            },
          },
        },
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
    const { description, name, productId, img } = dto;

    const course = await this.prisma.course.create({
      data: {
        name,
        slug: translit(name),
        description,
        img,
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
    const { description, name, productId, img } = dto;

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
        img,
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

    if (!oldCourse)
      throw new NotFoundException(`Курс под номером ${id} не найден`);

    const course = await this.prisma.course.delete({
      where: {
        id: id,
      },
    });

    return course;
  }
}
