import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ScheduleAccess } from 'src/auth/guards/scheduleAccess.guard';

export const ScheduleAccessDec = () =>
  applyDecorators(UseGuards(JwtAuthGuard, ScheduleAccess));
