import { Prisma } from '@prisma/client';

export const returnUserObject: Prisma.UserSelect = {
  id: true,
  email: true,
  name: true,
  surname: true,
  family: true,
  phone: true,
  avatarId: true,
  birthday: true,
  active: true,
  role: true,
  orders: true,
  supports: true,
  region: true,
  social: true,
  tg_id: true,
  scheduleTimeStudent: {
    select: {
      status: true,
    },
  },
  completeTests: {
    select: {
      testId: true,
      userId: true,
    },
  },
  completeCourseChapters: {
    select: {
      courseChapterId: true,
      userId: true,
    },
  },
  completeCourses: {
    select: {
      courseId: true,
      userId: true,
    },
  },
  completeLection: {
    select: {
      lectionId: true,
      userId: true,
    },
  },
  boughtCourses: {
    select: {
      courseId: true,
      userId: true,
    },
  },
};
