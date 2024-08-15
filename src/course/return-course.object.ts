import { Prisma } from '@prisma/client';

export const returnCourseObject: Prisma.CourseSelect = {
  name: true,
  slug: true,
  description: true,
  img: true,
  chapters: {
    select: {
      name: true,
      id: true,
      lection: {
        select: {
          name: true,
          slug: true,
        },
      },
      test: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      id: 'asc',
    },
  },

  // productId: true,
  // BoughtCourses: true,
};
