import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseChapterService } from 'src/course_chapter/course_chapter.service';
import { PrismaService } from 'src/prisma.service';
import translit from 'src/utils/generate-slug';
import { LectionDto } from './dto/lection.dto';
import { returnLectionObject } from './return-lection.object';

@Injectable()
export class LectionService {
  constructor(
    private prisma: PrismaService,
    private courseChapterService: CourseChapterService,
  ) {}

  async getAll() {
    const lection = await this.prisma.lection.findMany({
      select: {
        ...returnLectionObject,
      },
    });

    if (!lection) throw new NotFoundException(`Лекции не найдены`);

    return lection;
  }

  async getById(id: number) {
    const lection = await this.prisma.lection.findUnique({
      where: {
        id: id,
      },
      select: {
        ...returnLectionObject,
      },
    });

    if (!lection) throw new NotFoundException(`Лекция не найдена`);

    return lection;
  }

  async getBySlug(slug: string, userId: number) {
    const lection = await this.prisma.lection.findUnique({
      where: {
        slug: slug,
      },
      select: {
        courseChapter: {
          select: {
            id: true,
            courseId: true,
            test: {
              select: {
                slug: true,
              },
            },
          },
        },
        id: true,
        materials: true,
        name: true,
        slug: true,
        source: true,
      },
    });

    const completedCourseChapters =
      await this.courseChapterService.findCompleteCourseChapters(
        userId,
        lection.courseChapter.courseId,
      );
    const courseChapterCompleted =
      completedCourseChapters.findIndex(
        (item) => item.courseChapterId == lection.courseChapter.id,
      ) !== -1;

    return { ...lection, courseChapterCompleted: courseChapterCompleted };
  }

  async createCompleteLection(slug: string, userId: number) {
    const qwe = await this.prisma.lection.findUnique({
      where: {
        slug: slug,
      },
    });
    const completeLection = await this.prisma.completeLections.create({
      data: {
        lectionId: qwe.id,
        userId: userId,
      },
    });

    const courseChapter =
      await this.courseChapterService.getCourseChapterByLectionId(qwe.id);

    if (courseChapter.test == null) {
      const qwe = await this.courseChapterService.completeCourseChapter(
        courseChapter.id,
        userId,
      );
    }

    return completeLection;
  }

  async getCompletedLectionByCourseId(courseId: number, userId: number) {
    const completedLectionByCourseId =
      await this.prisma.completeLections.findMany({
        where: {
          userId: userId,
          lection: {
            courseChapter: {
              courseId: courseId,
            },
          },
        },
      });

    return completedLectionByCourseId;
  }

  async getAllByCourseId(courseId: number) {
    const lections = await this.prisma.lection.findMany({
      where: {
        courseChapter: {
          courseId: courseId,
        },
      },
    });

    return lections;
  }

  async create(dto: LectionDto) {
    const { courseChapterId, materials, name, source } = dto;

    const lection = await this.prisma.lection.create({
      data: {
        name,
        slug: translit(name),
        materials,
        source,
        courseChapter: {
          connect: {
            id: courseChapterId,
          },
        },
      },
    });

    return lection;
  }

  async update(id: number, dto: LectionDto) {
    const { courseChapterId, materials, name, source } = dto;

    const oldLection = this.getById(id);

    if (!oldLection)
      throw new NotFoundException(`Лекция под номером ${id} не найдена`);

    const lection = await this.prisma.lection.update({
      where: {
        id: id,
      },
      data: {
        name,
        slug: translit(name),
        materials,
        source,
        courseChapter: {
          connect: {
            id: courseChapterId,
          },
        },
      },
    });

    return lection;
  }

  async delete(id: number) {
    const oldLection = this.getById(id);

    if (!oldLection)
      throw new NotFoundException(`Лекция под номером ${id} не найдена`);

    const lection = await this.prisma.lection.delete({
      where: {
        id: id,
      },
    });

    return lection;
  }
}
