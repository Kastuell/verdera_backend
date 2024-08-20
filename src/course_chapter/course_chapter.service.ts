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

  async getCourseChaptersByCourseId(id: number) {
    const courseChapters = await this.prisma.courseChapter.findMany({
      where: {
        courseId: id,
      },
      orderBy: {
        id: 'asc',
      },
      select: {
        lection: {
          select: {
            id: true,
            courseChapterId: true
          },
        },
        test: {
          select: {
            id: true,
          },
        },
        id: true
      },
    });

    return courseChapters;
  }

  async findCompleteCourseChapters(userId: number, courseId: number) {
    const compelteCourseChapter =
      await this.prisma.completeCourseChapters.findMany({
        where: {
          courseChapter: {
            courseId: courseId,
          },
          userId: userId,
        },
        orderBy: {
          courseChapterId: 'asc',
        },
        select: {
          userId: true,
          courseChapterId: true,
          courseChapter: true,
          user: true,
        },
      });
    return compelteCourseChapter;
  }

  async getCourseChapterByLectionId(lectionId: number) {
    const courseChapter = await this.prisma.courseChapter.findMany({
      where: {
        lection: {
          id: lectionId,
        },
      },
      select: {
        test: true,
        lection: true,
        id: true,
        courseId: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return courseChapter[0];
  }

  async getCourseChapterByTestId(testId: number) {
    const courseChapter = await this.prisma.courseChapter.findMany({
      where: {
        test: {
          id: testId,
        },
      },
      select: {
        test: true,
        lection: true,
        id: true,
        courseId: true,
        course: {
          select: {
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
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    if (courseChapter[0] == undefined)
      throw new NotFoundException('CourseChapterByTestId not found');

    return courseChapter[0];
  }

  // async findCompleteCourseChapterByCourseChapterId(courseChapterId: number, userId: number) {
  //   const compelteCourseChapter =
  //     await this.prisma.completeCourseChapters.findUnique({
  //       where: {
  //         userId_courseChapterId: {
  //           courseChapterId: courseChapterId,
  //           userId: userId,
  //         },
  //       },
  //     });
  //   return compelteCourseChapter;
  // }

  async completeCourseChapter(courseChapterId: number, userId: number) {
    const compelteCourseChapter =
      await this.prisma.completeCourseChapters.create({
        data: {
          courseChapterId: courseChapterId,
          userId: userId,
        },
      });
    return compelteCourseChapter;
  }

  async getByCourseSlug(courseSlug: string, userId: number) {
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

    const completeCourseChaptersIds = (
      await this.findCompleteCourseChapters(userId, courseChapters[0].courseId)
    ).map((Item) => Item.courseChapterId);

    const mapped = courseChapters.map((item) => {
      return {
        ...item,
        completed: completeCourseChaptersIds.includes(item.id) ? true : false,
      };
    });

    const temp = mapped.findIndex((item) => item.completed == false);

    return mapped.map((item, index) => {
      return {
        ...item,
        unlocked: index <= temp ? true : false,
      };
    });
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
