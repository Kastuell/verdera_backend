import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CourseService } from 'src/course/course.service';
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

    if (ids.includes(courseChapter.courseId) || user.role == 'ADMIN')
      return lection;
    
    throw new BadRequestException('У вас нет доступа к этой лекции')
    
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

    if (oldLection)
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
