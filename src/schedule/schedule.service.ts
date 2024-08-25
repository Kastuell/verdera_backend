import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import 'moment/locale/ru';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { TimeDto } from './dto/schedule.dto';
import {
  returnDayObject,
  returnTimeObject,
  returnWeekObject,
} from './returnSchedule.objects';

@Injectable()
export class ScheduleService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  // @Cron(CronExpression.EVERY_SECOND)
  // handleCron() {
  //   console.log("qwe")
  // }

  async getAllDays() {
    const days = await this.prisma.scheduleDay.findMany({
      select: {
        ...returnDayObject,
      },
    });

    if (!days) throw new NotFoundException(`Дни не найдены`);

    return days;
  }

  // async createDay(dto: ScheduleDayDto) {
  //   const day = await this.prisma.scheduleDay.create({
  //     data: {
  //       ...dto,
  //     },
  //     select: {
  //       ...returnDayObject,
  //     },
  //   });

  //   return day;
  // }
  async getDayById(dayId: number) {
    const day = await this.prisma.scheduleDay.findUnique({
      where: {
        id: dayId,
      },
      select: {
        ...returnDayObject,
      },
    });

    if (!day) throw new NotFoundException(`Дня с id: ${dayId} не найдено`);

    return day;
  }

  /////////////////////////   WEEK BLOCK   ////////////////////////////////////

  async getAllWeeks() {
    const allWeeks = await this.prisma.scheduleWeek.findMany({
      select: {
        ...returnWeekObject,
      },
    });

    if (!allWeeks) throw new NotFoundException('Недели не найдены');

    return allWeeks;
  }

  async getLastWeek() {
    const allWeeks = await this.getAllWeeks();

    return allWeeks[allWeeks.length - 1];
  }

  @Cron(CronExpression.EVERY_WEEK)
  async createWeek() {
    const lastWeek = await this.getLastWeek();

    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    if (lastWeek) {
      const lastDayOfWeek = lastWeek.days[6].date;

      const arr: { date: string; day_of_week: string; day_month: string }[] =
        [];

      for (let i = 0; i <= 6; i++) {
        const temp = moment(lastDayOfWeek).add(i + 1, 'days');
        arr.push({
          date: temp.format('MM/DD/YYYY'),
          day_of_week: temp.format('dddd'),
          day_month: temp.format('D MMMM'),
        });
      }

      const week = await this.prisma.scheduleWeek.create({
        data: {
          days: {
            createMany: {
              data: arr,
            },
          },
          week_start: moment(arr[0].date).format('D MMMM'),
          week_end: moment(arr[6].date).format('D MMMM'),
          week_end_meta: arr[6].date,
          week_start_meta: arr[0].date,
        },
        include: {
          days: {
            select: {
              ...returnDayObject,
            },
          },
        },
      });

      return week;
    } else {
      let currentDate = moment().format('MM/DD/YYYY');

      let weekStartDay = null;

      while (weekStartDay == null) {
        currentDate = moment(currentDate).add(1, 'days').format('MM/DD/YYYY');
        if (days[moment(currentDate).isoWeekday()] == 'Monday') {
          weekStartDay = currentDate;
        }
      }

      const arr = [];

      for (let i = 0; i <= 6; i++) {
        const temp = moment(weekStartDay).add(i, 'days');
        arr.push({
          date: temp.format('MM/DD/YYYY'),
          day_of_week: temp.format('dddd'),
          day_month: temp.format('D MMMM'),
        });
      }

      const week = await this.prisma.scheduleWeek.create({
        data: {
          days: {
            createMany: {
              data: arr,
            },
          },
          week_start: moment(arr[0].date).format('D MMMM'),
          week_end: moment(arr[6].date).format('D MMMM'),
          week_end_meta: arr[6].date,
          week_start_meta: arr[0].date,
        },
        include: {
          days: {
            select: {
              ...returnDayObject,
            },
          },
        },
      });

      return week;
    }
  }

  async getWeekById(weekId: number) {
    const week = await this.prisma.scheduleWeek.findUnique({
      where: {
        id: weekId,
      },
      select: {
        ...returnWeekObject,
      },
    });

    if (!week) throw new NotFoundException(`Недели с id: ${weekId} не найдено`);

    return week;
  }

  async getWeekByIncludingDate(date: string) {
    const day = await this.prisma.scheduleDay.findUnique({
      where: {
        date: date,
      },
      select: {
        ...returnDayObject,
      },
    });

    if (!day) {
      const week = await this.prisma.scheduleWeek.findFirst({
        select: {
          ...returnWeekObject,
        },
      });

      if (!week) {
        throw new NotFoundException('Такого дня нет');
      }

      return week;
    } else {
      const week = await this.getWeekById(day.scheduleWeekId);

      return week;
    }
  }

  async getNextWeek(weekId: number) {
    const week = await this.getWeekById(weekId);

    const firstDayNextWeek = moment(week.days[6].date)
      .add(1, 'days')
      .format('MM/DD/YYYY');

    const nextWeek = await this.getWeekByIncludingDate(firstDayNextWeek);

    return nextWeek;
  }

  async getCurrentWeeks() {
    const curDate = moment().format('MM/DD/YYYY');

    const currentWeek = await this.getWeekByIncludingDate(curDate);

    const nextWeek = await this.getNextWeek(currentWeek.id);

    return {
      currentWeek,
      nextWeek,
    };
  }

  /////////////////////////   TIME BLOCK   ////////////////////////////////////

  async addTime(dto: TimeDto, teacherId: number) {
    const { dayId, time } = dto;

    const day = await this.getDayById(dayId);

    if (day.time.findIndex((item) => item.time == time) !== -1)
      throw new BadRequestException('Такое время уже присутствует');

    const scheduleTime = await this.prisma.scheduleTime.create({
      data: {
        time,
        sheduleDay: {
          connect: {
            id: dayId,
          },
        },
        teacher: {
          connect: {
            id: teacherId,
          },
        },
      },
      select: {
        ...returnTimeObject,
      },
    });

    return scheduleTime;
  }

  async deleteTime(timeId: number) {
    const scheduleTime = await this.prisma.scheduleTime.delete({
      where: {
        id: timeId,
      },
      select: {
        ...returnTimeObject,
      },
    });

    return scheduleTime;
  }

  async selectTime(timeId: number, studentId: number) {
    const time = await this.getTimeById(timeId);

    const { scheduleTimeStudent: wqe } =
      await this.userService.getById(studentId);

    const scheduleTimeStudent = wqe ?? [];

    const alreadySelected = scheduleTimeStudent.map(
      (item) => item.status == 'PENDING' || item.status == 'SELECTED',
    );

    if (alreadySelected.length == 3)
      throw new BadRequestException(
        'Вы не можете выбрать более трёх занятий одновременно',
      );

    if (time.studentId == studentId && time.status == 'PENDING')
      throw new BadRequestException('Вы уже выбрали это время');

    if (time.status !== 'FREE')
      throw new BadRequestException('Это время выбрал другой пользователь');

    const selectedTime = await this.prisma.scheduleTime.update({
      where: {
        id: timeId,
      },
      data: {
        student: {
          connect: {
            id: studentId,
          },
        },
        status: 'PENDING',
      },
    });

    return selectedTime;
  }

  async endTime(timeId: number) {
    const time = await this.getTimeById(timeId);

    if (time.status == 'END')
      throw new BadRequestException('Время уже закончено');

    const endTime = await this.prisma.scheduleTime.update({
      where: {
        id: timeId,
      },
      data: {
        status: 'END',
      },
    });

    return endTime;
  }

  /// only for teachers
  async approveTime(timeId: number) {
    const time = await this.getTimeById(timeId);

    if (time.status !== 'PENDING')
      throw new BadRequestException('Статус времени не PENDING');

    const approvedTime = await this.prisma.scheduleTime.update({
      where: {
        id: timeId,
      },
      data: {
        status: 'SELECTED',
      },
    });

    return approvedTime;
  }

  async getTimeById(timeId: number) {
    const time = await this.prisma.scheduleTime.findUnique({
      where: {
        id: timeId,
      },
    });

    if (!time) throw new NotFoundException('Время не найдено');

    return time;
  }

  async cancelTime(timeId: number, userId: number) {
    const time = await this.getTimeById(timeId);

    const user = await this.userService.getById(userId);

    if (!time.studentId)
      throw new BadRequestException('На это никто не записан');

    if (user.role == 'ADMIN' || user.role == 'TEACHER') {
      const canceledTime = await this.prisma.scheduleTime.update({
        where: {
          id: timeId,
        },
        data: {
          student: {
            disconnect: {
              id: time.studentId,
            },
          },
          status: 'FREE',
        },
      });

      return canceledTime;
    } else if (user.role == 'STUDENT') {
      if (time.studentId !== userId)
        throw new BadRequestException('У вас нет доступа к этому времени');

      if (time.status !== 'PENDING')
        throw new BadRequestException('Вы не можете отменить это время');

      const canceledTime = await this.prisma.scheduleTime.update({
        where: {
          id: timeId,
        },
        data: {
          student: {
            disconnect: {
              id: userId,
            },
          },
          status: 'FREE',
        },
      });

      return canceledTime;
    }
  }
}
