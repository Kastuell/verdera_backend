import { Prisma } from '@prisma/client';
import { returnTestObject } from 'src/course_test/return-test.object';
import { returnLectionObject } from 'src/lection/return-lection.object';

export const returnCourseChapterObject: Prisma.CourseChapterSelect = {
  id: true,
  name: true,
  lection: {
    select: {
      ...returnLectionObject
    }
  },
  test: {
    select: {
      ...returnTestObject
    }
  },
  // course: {
  //   select: {
  //     id: true,
  //     name: true,
  //   },
  // },
};
