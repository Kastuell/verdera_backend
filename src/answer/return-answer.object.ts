import { Prisma } from '@prisma/client';

export const returnAnswerObject: Prisma.AnswerSelect = {
  id: true,
  value: true,
  questionId: true,
  questionCorrectId: true,
};
