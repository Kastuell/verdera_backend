import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { CompleteCourses, User } from '@prisma/client';

@Injectable()
export class ScheduleAccess implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ user: User & { completeCourses: CompleteCourses[] } }>();
    const user = request.user;

    if (!user) throw new ForbiddenException('У вас нет прав!');
    
    if (user.completeCourses.length !== 0) return true;
  }
}
