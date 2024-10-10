import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import 'moment/locale/ru';
import { BotMainUpdate } from 'src/bot/updates/main.update';
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
    private botUpdate: BotMainUpdate,
  ) {}

  // @Cron(CronExpression.EVERY_SECOND)
  // handleCron() {
  //   console.log("qwe")
  // }

  async getCloserWeekDayByDate(date: string) {
    const week = await this.prisma.scheduleWeek.findFirst();

    const day = await this.prisma.scheduleDay.findUnique({
      where: {
        date: date,
      },
      select: {
        ...returnDayObject,
      },
    });
    if (day) return day;
    else if (!day) {
      const new_day = await this.prisma.scheduleDay.findUnique({
        where: {
          date: week.week_start_meta,
        },
        select: {
          ...returnDayObject,
        },
      });
      return new_day;
    }
  }

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
      const new_day = await this.getCloserWeekDayByDate(date);
      if (!new_day) {
        throw new NotFoundException('Такого дня нет new_day');
      }
      const week = await this.prisma.scheduleWeek.findUnique({
        where: {
          week_start_meta: new_day.date,
        },
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
      nextWeek,
      currentWeek,
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

    const {
      scheduleTimeStudent: wqe,
      email,
      phone,
      name,
      family,
      surname,
      role,
    } = await this.userService.getById(studentId);

    const scheduleTimeStudent = wqe ?? [];

    const alreadySelected = scheduleTimeStudent.filter(
      (item) => item.status == 'PENDING' || item.status == 'SELECTED',
    );

    if (alreadySelected.length == 3 && role !== 'ADMIN')
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
      select: {
        sheduleDay: {
          select: {
            date: true,
          },
        },
        time: true,
        teacherId: true,
      },
    });

    await this.botUpdate.notificate(
      [selectedTime.teacherId],
      `Студент: ${family} ${name} ${surname} ⏳\n\nC почтой: ${email}\n\nC телефоном: ${phone}\n\nЗаписался на ${moment(selectedTime.sheduleDay.date).format('DD.MM.YYYY')}, по времени: ${selectedTime.time}`,
    );

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
  async approveTime(timeId: number, userId: number) {
    const time = await this.getTimeById(timeId);

    if (time.status !== 'PENDING')
      throw new BadRequestException('Статус времени не PENDING');

    if (time.teacherId !== userId)
      throw new BadRequestException('Вы не можете подтвердить не Ваше время');

    const { role, email, phone, name, family, surname } =
      await this.userService.getById(userId);

    const approvedTime = await this.prisma.scheduleTime.update({
      where: {
        id: timeId,
      },
      data: {
        status: 'SELECTED',
      },
      select: {
        sheduleDay: {
          select: {
            date: true,
          },
        },
        time: true,
        student: {
          select: {
            name: true,
            family: true,
            surname: true,
          },
        },
        teacherId: true,
      },
    });

    await this.botUpdate.notificate(
      [approvedTime.teacherId],
      `Вы: ${family} ${name} ${surname} ✅\n\nПодтвердили запись студента: ${approvedTime.student.family} ${approvedTime.student.name} ${approvedTime.student.surname} на ${moment(approvedTime.sheduleDay.date).format('DD.MM.YYYY')}, по времени: ${approvedTime.time}`,
    );

    return approvedTime;
  }

  async cancelTime(timeId: number, userId: number) {
    const time = await this.getTimeById(timeId);

    const { role, email, phone, name, family, surname } =
      await this.userService.getById(userId);

    if (!time.studentId)
      throw new BadRequestException('На это время никто не записан');

    if (role == 'ADMIN' || role == 'TEACHER') {
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
    } else if (role == 'STUDENT') {
      if (time.studentId !== userId)
        throw new BadRequestException('У вас нет доступа к этому времени');

      // if (time.status !== 'PENDING')
      //   throw new BadRequestException('Вы не можете отменить это время, так как статус заявки "На рассмотрении"');

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
        select: {
          sheduleDay: {
            select: {
              date: true,
            },
          },
          time: true,
          teacherId: true,
        },
      });

      await this.botUpdate.notificate(
        [canceledTime.teacherId],
        `Студент: ${family} ${name} ${surname} ❌\n\nC почтой: ${email}\n\nC телефоном: ${phone}\n\nОтменил запись на ${moment(canceledTime.sheduleDay.date).format('DD.MM.YYYY')}, по времени: ${canceledTime.time}`,
      );

      return canceledTime;
    }
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
}
