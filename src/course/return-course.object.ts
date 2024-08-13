import { Prisma } from '@prisma/client';
import { returnCourseChapterObject } from 'src/course_chapter/return-course_chapter.object';

export const returnCourseObject: Prisma.CourseSelect = {
  name: true,
  slug: true,
  description: true,
  img: true,
  chapters: {
    select: {
      ...returnCourseChapterObject,
    },
    orderBy: {
      id: 'asc',
    },
  },

  // productId: true,
  // BoughtCourses: true,
};
