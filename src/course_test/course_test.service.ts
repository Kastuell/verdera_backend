import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseChapterService } from 'src/course_chapter/course_chapter.service';
import { LectionService } from 'src/lection/lection.service';
import { PrismaService } from 'src/prisma.service';
import { QuestionService } from 'src/question/question.service';
import { returnQuestionObject } from 'src/question/return-question.object';
import translit from 'src/utils/generate-slug';
import { shuffle } from '../utils/shufle';
import { CheckTestDto, TestDto } from './dto/test.dto';
import { returnTestObject } from './return-test.object';

@Injectable()
export class CourseTestService {
  constructor(
    private prisma: PrismaService,
    private courseChapterService: CourseChapterService,
    private lectionService: LectionService,
    private questionService: QuestionService,
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

  async findCompleteTest(testId: number, userId: number) {
    const completeTest = await this.prisma.completeTest.findUnique({
      where: {
        userId_testId: {
          testId: testId,
          userId: userId,
        },
      },
    });

    if (!completeTest) throw new NotFoundException('Не найдено');

    return completeTest;
  }

  async createCompleteTest(userId: number, testId: number) {
    const completeTest = await this.findCompleteTest(testId, userId);

    if (completeTest) throw new BadRequestException('Вы уже решили этот тест');

    return await this.prisma.completeTest.create({
      data: {
        testId: testId,
        userId: userId,
      },
    });
  }

  async checkTest(dto: CheckTestDto, userId: number) {
    const courseChapter =
      await this.courseChapterService.findCourseChapterByTestId(dto.testId);

    const completeLection = await this.lectionService.findCompleteLection(
      courseChapter.lection.id,
      userId,
    );

    if (!completeLection)
      throw new BadRequestException('Вы ещё не прошли лекцию');

    const completeTest = await this.findCompleteTest(dto.testId, userId);

    if (completeTest) throw new BadRequestException('Вы уже решили этот тест');

    const questionIds = dto.userTest.map((item) => item.questId);

    const thisQuestions =
      await this.questionService.findQuestionsByIds(questionIds);

    const sortedUserTest = dto.userTest.sort((a, b) => a.questId - b.questId);

    const thisQuestionsMapped = thisQuestions.map((item) => ({
      questId: item.id,
      answerId: item.answers.map((item) => item.id),
    }));

    const result = sortedUserTest.map((i, index) => {
      const qwe = thisQuestionsMapped[index].answerId.map((item) =>
        i.answerId.includes(item),
      );

      if (
        i.questId == thisQuestionsMapped[index].questId &&
        !qwe.includes(false)
      ) {
        return {
          questionId: i.questId,
          answerId: i.answerId,
          isCorrect: true,
        };
      } else if (
        i.questId == thisQuestionsMapped[index].questId &&
        qwe.includes(false)
      ) {
        return {
          questionId: i.questId,
          answerId: i.answerId,
          isCorrect: false,
        };
      }
    });

    if (result.findIndex((item) => item.isCorrect == false) == -1) {
      await this.createCompleteTest(userId, dto.testId);

      // const courseId = thisQuestions[0].test.courseChapter.courseId;

      // const content = (await this.courseService.getById(courseId)).chapters
      //   .map((item) => {
      //     if (item.lection !== null && item.test !== null) return 2;
      //     else if (item.lection !== null || item.test !== null) return 1;
      //   })
      //   .filter((i) => i !== undefined)
      //   .reduce((prev, cur) => prev + cur, 0);

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
