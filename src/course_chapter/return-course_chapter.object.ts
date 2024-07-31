import { Prisma } from '@prisma/client';

export const returnCourseChapterObject: Prisma.CourseChapterSelect = {
  id: true,
  name: true,
  lection: true,
  test: true,
  course: {
    select: {
      id: true,
      name: true,
    },
  },
};
