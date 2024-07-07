import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleT } from 'src/auth/dto/auth.dto';
import { OnlyAdminGuard } from 'src/auth/guards/admin.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { OnlyStudentGuard } from 'src/auth/guards/student.guard';
import { OnlyTeacherGuard } from 'src/auth/guards/teacher.guard';
import { OnlyUserGuard } from 'src/auth/guards/user.guard';


export const Auth = (role: RoleT = 'USER') => applyDecorators(

    role == 'ADMIN'
        ? UseGuards(JwtAuthGuard, OnlyAdminGuard)
        : UseGuards(JwtAuthGuard),
    role == 'TEACHER'
        ? UseGuards(JwtAuthGuard, OnlyTeacherGuard)
        : UseGuards(JwtAuthGuard),
    role == 'STUDENT'
        ? UseGuards(JwtAuthGuard, OnlyStudentGuard)
        : UseGuards(JwtAuthGuard),
    role == 'USER'
        ? UseGuards(JwtAuthGuard, OnlyUserGuard)
        : UseGuards(JwtAuthGuard),

)