import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import translit from 'src/utils/generate-slug';
import { TestDto } from './dto/test.dto';
import { returnTestObject } from './return-test.object';

@Injectable()
export class CourseTestService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const tests = await this.prisma.test.findMany({
      select: {
        ...returnTestObject,
      },
    });

    if (!tests) throw new NotFoundException('Тесты не найдены');

    return tests;
  }

  async getById(id: number) {
    const test = await this.prisma.test.findUnique({
      where: {
        id: id,
      },
      select: {
        ...returnTestObject,
      },
    });

    if (!test) throw new NotFoundException('Тест не найден');

    return test;
  }

  async getBySlug(slug: string) {
    const test = await this.prisma.test.findUnique({
      where: {
        slug: slug,
      },
      select: {
        ...returnTestObject,
      },
    });

    if (!test) throw new NotFoundException('Тест не найден');

    return test;
  }

  async create(dto: TestDto) {
    const test = await this.prisma.test.create({
      data: {
        name: dto.name,
        slug: translit(dto.name),
        courseChapter: {
          connect: {
            id: dto.courseChapterId,
          },
        },
      },
    });

    return test;
  }

  async update(id: number, dto: TestDto) {
    const test = await this.prisma.test.update({
      where: {
        id: id,
      },
      data: {
        name: dto.name,
        slug: translit(dto.name),
        courseChapter: {
          connect: {
            id: dto.courseChapterId,
          },
        },
      },
    });

    return test;
  }

  async delete(id: number) {
    const test = await this.prisma.test.delete({
      where: {
        id: id,
      },
    });
    return test;
  }
}
