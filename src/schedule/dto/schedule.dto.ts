import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString, Validate } from 'class-validator';
import { CustomTimeType } from 'src/decorators/customTimeType';

export class ScheduleDayDto implements Prisma.ScheduleDayUpdateInput {
  @IsString()
  date: string;
}

export class ScheduleWeekDto {
  @IsDate()
  @Type(() => Date)
  //   month day year
  date: Date;
}

export class TimeDto {
  @IsNumber()
  dayId: number;

  @Validate(CustomTimeType, {
    message: 'Invalid Time Format',
  })
  time: string;
}
