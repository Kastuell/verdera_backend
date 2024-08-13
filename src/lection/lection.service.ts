import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseService } from 'src/course/course.service';
import { CourseChapterService } from 'src/course_chapter/course_chapter.service';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import translit from 'src/utils/generate-slug';
import { LectionDto } from './dto/lection.dto';
import { returnLectionObject } from './return-lection.object';

@Injectable()
export class LectionService {
  constructor(
    private prisma: PrismaService,
    private courseService: CourseService,
    private userService: UserService,
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

  async getBySlug(userId: number, slug: string) {
    const lection = await this.prisma.lection.findUnique({
      where: {
        slug: slug,
      },
    });

    const boughtCourses =
      await this.courseService.getBoughtCoursesByUserId(userId);

    const ids = boughtCourses.map((item) => item.courseId);

    const user = await this.userService.getById(userId);

    if (!lection) throw new NotFoundException(`Лекция не найдена`);

    const courseChapter = await this.prisma.courseChapter.findUnique({
      where: {
        id: lection.courseChapterId,
      },
    });

    const isPrevLectionCompleted = await this.isPrevLectionCompleted(
      lection.id,
      userId,
    );

    console.log(isPrevLectionCompleted);

    if (
      (ids.includes(courseChapter.courseId) && isPrevLectionCompleted) ||
      user.role == 'ADMIN'
    )
      return lection;

    throw new BadRequestException('У вас нет доступа к этой лекции');
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

  async getByCourseId(courseId: number) {
    const lections = await this.prisma.lection.findMany({
      where: {
        courseChapter: {
          course: {
            id: courseId,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    if (!lections) throw new NotFoundException('Не найдены');

    return lections;
  }

  async getCourseIdByLectionId(lectionId: number) {
    const courseId = await this.prisma.lection.findMany({
      where: {
        id: lectionId,
      },
      select: {
        courseChapter: {
          select: {
            course: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!courseId) throw new NotFoundException('Не найдено');

    return courseId[0].courseChapter.course.id;
  }

  async getAllLectionsFromCourseByLectionId(lectionId: number) {
    const courseId = await this.getCourseIdByLectionId(lectionId);

    return await this.getByCourseId(courseId);
  }

  async findCompleteLection(lectionId: number, userId: number) {
    const completeLection = await this.prisma.completeLections.findUnique({
      where: {
        userId_lectionId: {
          lectionId: lectionId,
          userId: userId,
        },
      },
    });

    return completeLection;
  }

  async isPrevLectionCompleted(lectionId: number, userId: number) {
    const courseId = await this.getCourseIdByLectionId(lectionId);

    const completeCourseChapters =
      await this.courseChapterService.findCompleteCourseChapters(
        userId,
        courseId,
      );

    const courseChapters =
      await this.courseChapterService.getByCourseId(courseId);

    const indexPrev =
      courseChapters.findIndex((item) => item.lection.id == lectionId) - 1;

    const isIn =
      completeCourseChapters.findIndex(
        (item) => item.courseChapter.lection.id == courseChapters[indexPrev].id,
      ) == -1
        ? false
        : true;

    if (isIn) {
      return true;
    } else if (indexPrev == -1) {
      return true;
    } else {
      throw new BadRequestException('Нет доступа');
    }

    // if (
    //   completeCourseChapters.findIndex(
    //     (item) =>
    //       item.courseChapterId ==
    //       courseChapters[
    //         courseChapters.findIndex((item) => item.id == courseChapterId) - 1
    //       ].id,
    //   ) == -1
    // ) {
    //   return false;
    // }
  }

  async createCompleteLection(lectionId: number, userId: number) {
    const courseChapterByLectionId =
      await this.courseChapterService.findCourseChapterByLectionId(lectionId);

    const isPrevLectionCompleted = await this.isPrevLectionCompleted(
      lectionId,
      userId,
    );

    if (!isPrevLectionCompleted) {
      throw new BadRequestException('Вы ещё не прошли предыдущую главу!');
    }

    const completeLectionOld = await this.findCompleteLection(
      lectionId,
      userId,
    );

    if (completeLectionOld)
      throw new BadRequestException('Вы уже прошли эту лекцию');

    if (!courseChapterByLectionId.test) {
      await this.courseChapterService.createCompleteCourseChapter(
        courseChapterByLectionId.id,
        userId,
      );
    } else {
      return await this.prisma.completeLections.create({
        data: {
          lectionId: lectionId,
          userId: userId,
        },
      });
    }
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
