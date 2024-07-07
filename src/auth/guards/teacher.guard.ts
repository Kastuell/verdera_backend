import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";


@Injectable()
export class OnlyTeacherGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();

        // @ts-ignore
        const role = (request.user.role)

        if (role !== 'TEACHER' && role !== 'ADMIN') throw new ForbiddenException('У вас нет прав!')
        if (role == 'TEACHER' || role == 'ADMIN') return true
    }
}