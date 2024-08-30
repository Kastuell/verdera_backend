import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { ScheduleAccessDec } from 'src/decorators/scheduleAccess.decorator';
import { CurrentUser } from 'src/decorators/user.decorator';
import { TimeDto } from './dto/schedule.dto';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('day')
  @Auth('ADMIN')
  async getAllDays() {
    return await this.scheduleService.getAllDays();
  }

  @Get('day/:id')
  @Auth('ADMIN')
  async getDayById(@Param('id') id: string) {
    return await this.scheduleService.getDayById(Number(id));
  }

  ///////// WEEK

  @Get('week')
  @Auth('ADMIN')
  async getAllWeeks() {
    return await this.scheduleService.getAllWeeks();
  }

  @Post('week')
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  async createWeek() {
    return await this.scheduleService.createWeek();
  }

  @Get('week/:id')
  @Auth('ADMIN')
  async getWeekById(@Param('id') id: string) {
    return await this.scheduleService.getWeekById(Number(id));
  }

  @Auth('STUDENT')
  @Get('week-current')
  @ScheduleAccessDec()
  @UsePipes(new ValidationPipe())
  async getCurrentWeeks() {
    return await this.scheduleService.getCurrentWeeks();
  }

  ///////// TIME

  @Get('time/:id')
  @Auth('STUDENT')
  @ScheduleAccessDec()
  async getTimeById(@Param('id') timeId: string) {
    return await this.scheduleService.getTimeById(Number(timeId));
  }

  @Post('time')
  @Auth('TEACHER')
  @UsePipes(new ValidationPipe())
  async addTime(@Body() dto: TimeDto, @CurrentUser('id') teacherId: string) {
    return await this.scheduleService.addTime(dto, Number(teacherId));
  }

  @Delete('time/:id')
  @Auth('TEACHER')
  @UsePipes(new ValidationPipe())
  async deleteTime(@Param('id') timeId: string) {
    return await this.scheduleService.deleteTime(Number(timeId));
  }

  @Auth('STUDENT')
  @Put('time/select/:id')
  @ScheduleAccessDec()
  async selectTime(
    @Param('id') timeId: string,
    @CurrentUser('id') studentId: string,
  ) {
    return await this.scheduleService.selectTime(
      Number(timeId),
      Number(studentId),
    );
  }

  @Auth('TEACHER')
  @Put('time/end/:id')
  async endTime(@Param('id') timeId: string) {
    return await this.scheduleService.endTime(Number(timeId));
  }

  @Auth('TEACHER')
  @Put('time/approve/:id')
  async approveTime(
    @Param('id') timeId: string,
    @CurrentUser('id') userId: string,
  ) {
    return await this.scheduleService.approveTime(Number(timeId),Number(userId));
  }

  @Auth('STUDENT')
  @Put('time/cancel/:id')
  @ScheduleAccessDec()
  async cancelTime(
    @Param('id') timeId: string,
    @CurrentUser('id') userId: string,
  ) {
    return await this.scheduleService.cancelTime(
      Number(timeId),
      Number(userId),
    );
  }
}
