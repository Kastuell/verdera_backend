import { Prisma } from '@prisma/client';

export const returnCourseObject: Prisma.CourseSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  chapters: true,
  productId: true,
};
