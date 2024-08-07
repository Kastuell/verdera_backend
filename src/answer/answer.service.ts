import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AnswerDto } from './dto/answer.dto';
import { returnAnswerObject } from './return-answer.object';

@Injectable()
export class AnswerService {
  constructor(private prisma: PrismaService) {}
  async getAll() {
    const answers = await this.prisma.answer.findMany({
      select: {
        ...returnAnswerObject,
      },
    });

    if (!answers) throw new NotFoundException('Ответы не найдены');

    return answers;
  }

  async getById(id: number) {
    const answer = await this.prisma.answer.findUnique({
      where: {
        id: id,
      },
      select: {
        ...returnAnswerObject,
      },
    });

    if (!answer) throw new NotFoundException('Ответ не найден');

    return answer;
  }

  async create(dto: AnswerDto) {
    const { questionCorrectId, questionId, type, value } = dto;
    const answer = questionCorrectId
      ? await this.prisma.answer.create({
          data: {
            value: value,
            type: type,
            question: {
              connect: {
                id: questionId,
              },
            },
            questionCorrect: {
              connect: {
                id: questionCorrectId,
              },
            },
          },
        })
      : await this.prisma.answer.create({
          data: {
            value: value,
            type: type,
            question: {
              connect: {
                id: questionId,
              },
            },
          },
        });

    return answer;
  }

  async update(id: number, dto: AnswerDto) {
    const { questionCorrectId, questionId, type, value } = dto;
    const answer = questionCorrectId
      ? await this.prisma.answer.update({
          where: {
            id: id,
          },
          data: {
            value: value,
            type: type,
            question: {
              connect: {
                id: questionId,
              },
            },
            questionCorrect: {
              connect: {
                id: questionCorrectId,
              },
            },
          },
        })
      : await this.prisma.answer.update({
          where: {
            id: id,
          },
          data: {
            value: value,
            type: type,
            question: {
              connect: {
                id: questionId,
              },
            },
          },
        });

    return answer;
  }

  async delete(id: number) {
    const answer = await this.prisma.answer.delete({
      where: {
        id: id,
      },
    });

    return answer;
  }
}
