import { Prisma } from '@prisma/client';
import { returnQuestionObject } from 'src/question/return-question.object';

export const returnTestObject: Prisma.TestSelect = {
  id: true,
  name: true,
  questions: {
    select: {
      ...returnQuestionObject,
    },
  },
  slug: true,
};
