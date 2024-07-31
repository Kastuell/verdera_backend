import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { User } from "@prisma/client";


@Injectable()
export class OnlyTeacherGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<{ user: User }>();
        const user = request.user

        if (!user) throw new ForbiddenException('У вас нет прав!')
        if (user.role == 'TEACHER' ||
            user.role == 'ADMIN') return true
    }
}