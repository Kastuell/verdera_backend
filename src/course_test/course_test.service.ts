import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseService } from 'src/course/course.service';
import { PrismaService } from 'src/prisma.service';
import { returnQuestionObject } from 'src/question/return-question.object';
import { UserService } from 'src/user/user.service';
import translit from 'src/utils/generate-slug';
import { shuffle } from '../utils/shufle';
import { CheckTestDto, TestDto } from './dto/test.dto';
import { returnTestObject } from './return-test.object';

@Injectable()
export class CourseTestService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private courseService: CourseService,
  ) {}

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

  async getBySlug(slug: string, query: any) {
    const test = await this.prisma.test.findUnique({
      where: {
        slug: slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        questions: {
          // take: query['take'] ? Number(query.take) : 1000,
          select: {
            ...returnQuestionObject,
          },
        },
      },
    });
    if (!test) throw new NotFoundException('Тест не найден');

    const shuffledQuestion = shuffle(test.questions).slice(
      0,
      query['take'] ? Number(query.take) : 1000,
    );

    const { name } = test;

    const shuffledTest = {
      name,
      slug,
      questions: shuffledQuestion,
    };

    return shuffledTest;
  }

  async checkTest(dto: CheckTestDto, userId: number) {
    const completeTest = await this.prisma.completeTest.findUnique({
      where: {
        userId_testId: {
          userId: userId,
          testId: dto.testId,
        },
      },
    });

    if (completeTest !== null)
      throw new BadRequestException('Вы уже решили этот тест');

    const questionIds = dto.userTest.map((item) => item.questId);

    const thisQuestions = await this.prisma.question.findMany({
      where: {
        id: { in: questionIds },
      },
      select: {
        id: true,
        answers: {
          where: {
            questionCorrectId: {
              not: null,
            },
          },
          select: {
            id: true,
            questionCorrectId: true,
          },
        },
        test: {
          select: {
            courseChapter: {
              select: {
                courseId: true,
              },
            },
          },
        },
      },
    });

    const sortedUserTest = dto.userTest.sort((a, b) => a.questId - b.questId);

    const thisQuestionsMapped = thisQuestions.map((item) => ({
      questId: item.id,
      answerId: item.answers[0].id,
    }));

    if (
      JSON.stringify(sortedUserTest) === JSON.stringify(thisQuestionsMapped)
    ) {
      await this.userService.createCompleteTest(userId, dto.testId);

      const courseId = thisQuestions[0].test.courseChapter.courseId;

      const content = (await this.courseService.getById(courseId)).chapters
        .map((item) => {
          if (item.lection !== null && item.test !== null) return 2;
          else if (item.lection !== null || item.test !== null) return 1;
        })
        .filter((i) => i !== undefined)
        .reduce((prev, cur) => prev + cur, 0);

      await this.userService.createCompleteCourses(userId, courseId, [
        content,
        1,
      ]);

      return true;
    }

    return false;
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
