import { Prisma } from '@prisma/client';

export const returnTestObject: Prisma.TestSelect = {
  id: true,
  name: true,
  questions: {
    select:{
      name: true,
      correctAnswers: {
        select: {
          value: true
        }
      }
    }
  },

  slug: true,
};
