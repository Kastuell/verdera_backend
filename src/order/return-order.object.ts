import { Prisma } from '@prisma/client';
export const returnOrdersObject: Prisma.OrderSelect = {
  id: true,
  items: {
    select: {
      id: true,
      createdAt: true,
      price: true,
      quantity: true,
      orderId: true,
      product: {
        select: {
          id: true,
          name: true,
          subName: true,
          img: true,
          price: true,
        },
      },
    },
  },
  info: true,
  total: true,
  status: true,
  userId: true,
};
