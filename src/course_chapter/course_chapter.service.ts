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
    });

    if (!courseChapter) throw new NotFoundException(`Главы не найдены`);

    return courseChapter;
  }

  async getAllOwnCourses(){
    const courses = await this.prisma.user.findMany({
        where: {
            orders: {
                
            }
        }
    })
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
