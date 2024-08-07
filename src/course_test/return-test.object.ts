import { Prisma } from '@prisma/client';

export const returnTestObject: Prisma.TestSelect = {
  id: true,
  name: true,
  questions: true,
  slug: true,
};
