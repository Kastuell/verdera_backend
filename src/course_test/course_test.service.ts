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
    private questionService: QuestionService,
    private completeLection: LectionService,
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

  async getBySlug(slug: string, query: any, userId: number) {
    const id = await this.prisma.test.findUnique({
      where: {
        slug: slug,
      },
    });

    const courseChapter =
      await this.courseChapterService.getCourseChapterByTestId(id.id);

    const completeCourseChapters =
      await this.courseChapterService.findCompleteCourseChapters(
        userId,
        courseChapter.courseId,
      );

    const courseChapters =
      await this.courseChapterService.getCourseChaptersByCourseId(
        courseChapter.courseId,
      );

    const completeLections =
      await this.completeLection.getCompletedLectionByCourseId(
        courseChapter.courseId,
        userId,
      );

    const curLectionId = courseChapters.find(
      (item) => item.lection.courseChapterId == courseChapter.id,
    ).id;

    if (
      courseChapters[completeCourseChapters.length].id !== courseChapter.id ||
      completeLections.findIndex((item) => item.lectionId == curLectionId) == -1
    ) {
      throw new BadRequestException('Вам сюда рановато');
    }
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

    const shuffledQuestion = shuffle(
      test.questions.map((item) => {
        return {
          multi:
            item.answers.filter((item) => item.questionCorrectId !== null)
              .length > 1
              ? true
              : false,
          item,
        };
      }),
    ).slice(0, query['take'] ? Number(query.take) : 1000);

    const { name } = test;

    const shuffledTest = {
      id: test.id,
      name,
      slug,
      questions: shuffledQuestion,
    };

    return shuffledTest;
  }

  async createCompleteTest(testId: number, userId: number) {
    const completedTest = await this.prisma.completeTest.create({
      data: {
        testId: testId,
        userId: userId,
      },
    });

    return completedTest;
  }

  async getCompletedTestById(testId: number, userId: number) {
    const completedTest = await this.prisma.completeTest.findUnique({
      where: {
        userId_testId: {
          testId: testId,
          userId: userId,
        },
      },
    });

    return completedTest;
  }

  async checkTest(dto: CheckTestDto, userId: number) {
    const completedTestById = await this.getCompletedTestById(
      dto.testId,
      userId,
    );

    if (completedTestById)
      throw new BadRequestException('Вы уже решили этот тест');

    const courseChapter =
      await this.courseChapterService.getCourseChapterByTestId(dto.testId);

    const completeCourseChapters =
      await this.courseChapterService.findCompleteCourseChapters(
        userId,
        courseChapter.courseId,
      );

    const courseChapters =
      await this.courseChapterService.getCourseChaptersByCourseId(
        courseChapter.courseId,
      );

    if (courseChapters[completeCourseChapters.length].id !== courseChapter.id) {
      throw new BadRequestException('Вам сюда рановато');
    }

    const completeLections =
      await this.completeLection.getCompletedLectionByCourseId(
        courseChapter.courseId,
        userId,
      );

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
      await this.createCompleteTest(dto.testId, userId);

      if (
        courseChapter.lection == null ||
        completeLections.findIndex(
          (item) => item.lectionId == courseChapter.lection.id,
        ) !== -1
      ) {
        await this.courseChapterService.completeCourseChapter(
          courseChapter.id,
          userId,
        );
      }

      return {
        isCorrect: true,
      };
    }

    throw new BadRequestException('Тест решён неверно');
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
