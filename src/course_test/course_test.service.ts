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
import { CheckTestDto, SmartTestDto, TestDto } from './dto/test.dto';
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

    const shuffledQuestion: {
      multi: boolean;
      item: {
        id: number;
        name: string;
        answers: {
          id: number;
          value: string;
          questionCorrectId: null | number;
        }[];
      };
    }[] = shuffle(
      test.questions.map((item) => {
        const { answers, ...rest } = item;
        return {
          multi:
            item.answers.filter((item) => item.questionCorrectId !== null)
              .length > 1
              ? true
              : false,
          item: {
            ...rest,
            answers: shuffle(answers),
          },
        };
      }),
    ).slice(0, query['take'] ? Number(query.take) : 1000);

    const { name } = test;

    const shuffledTest = {
      id: test.id,
      name,
      slug,
      questions: shuffledQuestion.map((i) => {
        const { item } = i;
        const { answers, ...rest } = item;
        return {
          multi: i.multi,
          item: {
            ...rest,
            answers: answers.map((k) => {
              return {
                id: k.id,
                value: k.value,
              };
            }),
          },
        };
      }),
    };

    return shuffledTest;
  }

  async createSmart(dto: SmartTestDto) {
    const { name, questions } = dto;

    const { id: test_id } = await this.prisma.test.findUnique({
      where: {
        name: name,
      },
    });

    // const create_test = await this.prisma.test.create({
    //   data: {
    //     name: name,
    //     slug: translit(name),
    //     courseChapter: {
    //       connect: {
    //         id: 0,
    //       },
    //     },
    //   },
    // });

    // {
    //   id: number;
    //   name: string;
    //   correct_answer: string;
    //   questions: OptionsT[];
    // }

    const created_questions = questions.map(async (item) => {
      const { id, name } = await this.prisma.question.create({
        data: {
          name: item.name,
          slug: translit(item.name),
          test: {
            connect: {
              id: test_id,
            },
          },
        },
      });

      return {
        id,
        name,
        correct_answer: item.correctAnswer,
        questions: item.options,
      };
    });

    const result = created_questions.map(async (item) => {
      const answers = (await item).questions.forEach(async (it) => {
        if ((await item).correct_answer == it.letter) {
          await this.prisma.answer.create({
            data: {
              value: it.text,
              question: {
                connect: {
                  id: (await item).id,
                },
              },
              questionCorrect: {
                connect: {
                  id: (await item).id,
                },
              },
              type: '',
            },
          });
        } else {
          await this.prisma.answer.create({
            data: {
              value: it.text,
              question: {
                connect: {
                  id: (await item).id,
                },
              },
              type: '',
            },
          });
        }
      });
      return answers;
    });
    return result;
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

    const thisQuestionsMapped = thisQuestions
      .map((item) => ({
        questId: item.id,
        answerId: item.answers.map((item) => item.id),
      }))
      .sort((a, b) => a.questId - b.questId);

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

    // const isTestFullCorrect =
    //   result.findIndex((item) => item.isCorrect == false) == -1;

    const wrongs = result.filter((item) => item.isCorrect == false);

    if (wrongs.length == 0) {
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
        nextLectionSlug:
          courseChapters[completeCourseChapters.length + 1].lection.slug,
        testSlug: courseChapter.test.slug,
        wrongs,
      };
    } else if (wrongs.length <= 2) {
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
        nextLectionSlug:
          courseChapters[completeCourseChapters.length + 1].lection.slug,
        testSlug: courseChapter.test.slug,
        wrongs,
      };
    }

    return {
      isCorrect: false,
      curLectionSlug: courseChapter.lection.slug,
      testSlug: courseChapter.test.slug,
      wrongs,
    };
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
