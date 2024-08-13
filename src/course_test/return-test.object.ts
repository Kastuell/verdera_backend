import { Prisma } from '@prisma/client';

export const returnTestObject: Prisma.TestSelect = {
  id: true,
  name: true,
  questions: {
    select: {
      id: true,
    },
  },

  slug: true,
};
