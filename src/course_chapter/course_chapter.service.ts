import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CourseChapterDto } from './dto/course_chapter.dto';
import { returnCourseChapterObject } from './return-course_chapter.object';

@Injectable()
export class CourseChapterService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const courseChapter = await this.prisma.courseChapter.findMany({
      select: {
        ...returnCourseChapterObject,
      },
      orderBy: {
        id: 'asc',
      },
    });

    if (!courseChapter) throw new NotFoundException(`Главы не найдены`);

    return courseChapter;
  }

  async findCompleteCourseChapters(userId: number, courseId: number) {
    const completeCourseChapters =
      await this.prisma.completeCourseChapters.findMany({
        where: {
          userId: userId,
          courseChapter: {
            course: {
              id: courseId,
            },
          },
        },
        select: {
          courseChapter: {
            select: {
              lection: true,
              test: true,
              id: true,
              name: true,
            },
          },
          user: true,
          courseChapterId: true,
          userId: true,
        },
        orderBy: {
          courseChapterId: 'asc',
        },
      });

    if (!completeCourseChapters) throw new NotFoundException('Не найдено');

    return completeCourseChapters;
  }

  async findCompleteCourseChapter(courseChapterId: number, userId: number) {
    const completeCourseChapter =
      await this.prisma.completeCourseChapters.findUnique({
        where: {
          userId_courseChapterId: {
            courseChapterId: courseChapterId,
            userId: userId,
          },
        },
      });


    return completeCourseChapter;
  }

  async findCourseChapterByTestId(testId: number) {
    const completeCourseChapter = await this.prisma.courseChapter.findMany({
      where: {
        test: {
          id: testId,
        },
      },
      select: {
        id: true,
        lection: true,
        test: true,
        name: true,
        courseId: true,
      },
    });

    if (!completeCourseChapter) throw new NotFoundException('Не найдено');

    return completeCourseChapter[0];
  }

  async findCourseChapterByLectionId(lectionId: number) {
    const completeCourseChapter = await this.prisma.courseChapter.findMany({
      where: {
        lection: {
          id: lectionId,
        },
      },
      select: {
        test: true,
        lection: true,
        name: true,
        id: true,
      },
    });


    return completeCourseChapter[0];
  }

  async createCompleteCourseChapter(courseChapterId: number, userId: number) {
    const completeCourseChapter = await this.findCompleteCourseChapter(
      courseChapterId,
      userId,
    );

    if (completeCourseChapter)
      throw new NotFoundException('Вы уже прошли эту главу');

    return await this.prisma.completeCourseChapters.create({
      data: {
        courseChapterId,
        userId,
      },
    });
  }

  async getByCourseId(courseId: number) {
    const courseChapters = await this.prisma.courseChapter.findMany({
      where: {
        course: {
          id: courseId,
        },
      },
      select: {
        ...returnCourseChapterObject,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return courseChapters;
  }

  async getByCourseSlug(courseSlug: string) {
    const courseChapters = await this.prisma.courseChapter.findMany({
      where: {
        course: {
          slug: courseSlug,
        },
      },
      select: {
        ...returnCourseChapterObject,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return courseChapters;
  }

  async getById(id: number) {
    const courseChapter = await this.prisma.courseChapter.findUnique({
      where: {
        id: id,
      },
      select: {
        ...returnCourseChapterObject,
      },
    });

    if (!courseChapter)
      throw new NotFoundException(`Глава под номером "${id}" не найдена`);

    return courseChapter;
  }

  async create(dto: CourseChapterDto) {
    const { name, courseId } = dto;

    const courseChapter = await this.prisma.courseChapter.create({
      data: {
        name,
        course: {
          connect: {
            id: courseId,
          },
        },
      },
    });

    return courseChapter;
  }

  async update(id: number, dto: CourseChapterDto) {
    const { name, courseId } = dto;

    const oldCourseChapter = this.getById(id);

    if (oldCourseChapter)
      throw new NotFoundException(`Глава под номером ${id} не найдена`);

    const courseChapter = await this.prisma.courseChapter.update({
      where: {
        id: id,
      },
      data: {
        name,
        course: {
          connect: {
            id: courseId,
          },
        },
      },
    });

    return courseChapter;
  }

  async delete(id: number) {
    const oldCourseChapter = this.getById(id);

    if (oldCourseChapter)
      throw new NotFoundException(`Глава под номером ${id} не найдена`);

    const courseChapter = await this.prisma.courseChapter.delete({
      where: {
        id: id,
      },
    });

    return courseChapter;
  }
}
