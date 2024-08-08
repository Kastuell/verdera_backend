import { Prisma } from '@prisma/client';

export const returnQuestionObject: Prisma.QuestionSelect = {
  id: true,
  name: true,
  answers: {
    select: {
      id: true,
      value: true,
    },
  },
};
