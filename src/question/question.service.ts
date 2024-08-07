import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import translit from 'src/utils/generate-slug';
import { shuffle } from 'src/utils/shufle';
import { QuestionDto } from './dto/question.dto';
import { returnQuestionObject } from './return-question.object';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const questions = await this.prisma.question.findMany({
      select: {
        ...returnQuestionObject,
      },
    });

    if (!questions) throw new NotFoundException('Вопросы не найдены');

    return questions;
  }

  async getByTestSlugAndNQuantity(testSlug: string, n: number = 10) {
    const questionsId = shuffle((await this.getAll()).map((item) => item.id));

    const nOfQuestions = questionsId.slice(0, n);

    const questions = await this.prisma.question.findMany({
      where: {
        test: {
          slug: testSlug,
        },
        id: { in: nOfQuestions },
      },
    });

    return questions;
  }

  async getById(id: number) {
    const question = await this.prisma.question.findUnique({
      where: {
        id: id,
      },
      select: {
        ...returnQuestionObject,
      },
    });

    if (!question) throw new NotFoundException('Вопрос не найден');

    return question;
  }

  async getByTestSlug(testSlug: string) {
    const questions = await this.prisma.question.findMany({
      where: {
        test: {
          slug: testSlug,
        },
      },
      select: {
        ...returnQuestionObject,
      },
    });

    if (!questions) throw new NotFoundException('Вопросы не найден');

    return questions;
  }

  async getBySlug(slug: string) {
    const question = await this.prisma.question.findUnique({
      where: {
        slug: slug,
      },
      select: {
        ...returnQuestionObject,
      },
    });

    if (!question) throw new NotFoundException('Вопрос не найден');

    return question;
  }

  async create(dto: QuestionDto) {
    const question = await this.prisma.question.create({
      data: {
        name: dto.name,
        slug: translit(dto.name),
        test: {
          connect: {
            id: dto.testId,
          },
        },
        type: '',
      },
    });

    return question;
  }

  async update(id: number, dto: QuestionDto) {
    const question = await this.prisma.question.update({
      where: {
        id: id,
      },
      data: {
        name: dto.name,
        slug: translit(dto.name),
        test: {
          connect: {
            id: dto.testId,
          },
        },
        type: '',
      },
    });

    return question;
  }

  async delete(id: number) {
    const question = await this.prisma.question.delete({
      where: {
        id: id,
      },
    });

    return question;
  }
}
