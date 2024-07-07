import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Request } from "express";


@Injectable()
export class OnlyAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();

        // @ts-ignore
        const role = (request.user.role)

        if (role !== 'ADMIN') throw new ForbiddenException('У вас нет прав!')
        if (role == 'ADMIN') return true
    }
}