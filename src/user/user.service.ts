import { Injectable, NotFoundException } from '@nestjs/common';
import { EnumUserRoles } from '@prisma/client';
import { hash } from 'argon2';
import { AuthRegisterDto } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma.service';
import { UserDto } from './dto/user.dto';
import { returnUserFullObject } from './return-user.object';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
    ) { }

    async getAll() {
        return await this.prisma.user.findMany({
            select: {
                ...returnUserFullObject
            }
        })
    }

    async getById(id: number) {
        const user = await this.prisma.user.findUnique({
            where: {
                id
            },
            select: {
                ...returnUserFullObject
            }
        })

        if (!user) throw new NotFoundException('Пользователь не найден!')

        return user
    }

    async getByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                email
            }
        })

        return user
    }

    async create(dto: AuthRegisterDto) {
        const user = {
            birthday: dto.birthday,
            email: dto.email,
            family: dto.family,
            gender: dto.gender,
            name: dto.name,
            password: await hash(dto.password),
            phone: dto.phone,
            surname: dto.surname,
            avatar: '',
            role: EnumUserRoles.USER,
            active: true,
        }

        return this.prisma.user.create({
            data: user
        })
    }

    async update(id: number, dto: UserDto) {

        const {
            birthday,
            family,
            gender,
            name,
            phone,
            surname,
            avatar,
        } = dto

        return this.prisma.user.update({
            where: {
                id
            },
            data: {
                name,
                surname,
                family,
                phone,
                birthday,
                gender,
                avatar,
            }
        })
    }
}
