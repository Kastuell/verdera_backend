import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";


@Injectable()
export class OnlyStudentGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();

        // @ts-ignore
        const role = (request.user.role)

        if(role !== 'STUDENT' && role !== 'ADMIN' && role !== 'TEACHER') throw new ForbiddenException('У вас нет прав!')
        if(role == 'STUDENT' || 'ADMIN' || 'TEACHER') return true
    }
}