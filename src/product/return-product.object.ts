import { Prisma } from '@prisma/client';

export const returnProductObject: Prisma.ProductSelect = {
  id: true,
  name: true,
  slug: true,
  subName: true,
  img: true,
  price: true,
  category: true,
  description: true,
  potent: true,
};
