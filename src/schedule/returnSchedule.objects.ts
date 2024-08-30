import { Prisma } from '@prisma/client';
export const returnTimeObject: Prisma.ScheduleTimeSelect = {
  id: true,
  status: true,
  scheduleDayId: true,
  studentId: true,
  teacherId: true,
  time: true,
  sheduleDay: {
    select: {
      date: true,
    },
  },
};

export const returnDayObject: Prisma.ScheduleDaySelect = {
  id: true,
  date: true,
  scheduleWeekId: true,
  day_month: true,
  day_of_week: true,
  time: {
    select: {
      ...returnTimeObject,
    },
    orderBy: {
      time: 'asc',
    },
  },
};

export const returnWeekObject: Prisma.ScheduleWeekSelect = {
  id: true,
  days: {
    select: {
      ...returnDayObject,
    },
  },
  week_start: true,
  week_end: true,

  // week_end_meta: true,
  // week_start_meta: true
};
