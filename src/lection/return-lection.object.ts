import { Prisma } from '@prisma/client';

export const returnLectionObject: Prisma.LectionSelect = {
  id: true,
  name: true,
  slug: true,
  materials: true,
  source: true,
};
