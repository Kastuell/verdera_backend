import { Prisma } from '@prisma/client';

export const returnAnswerObject: Prisma.AnswerSelect = {
  id: true,
  value: true,
  type: true,
};
