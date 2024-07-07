import { Prisma } from "@prisma/client"
import { IsIn, IsOptional, IsString } from "class-validator"
import { GenderT } from "src/auth/dto/auth.dto"

export class UserDto implements Prisma.UserUpdateInput {
    @IsOptional()
    @IsString()
    name: string

    @IsOptional()
    @IsString()
    surname: string

    @IsOptional()
    @IsString()
    family: string

    @IsOptional()
    @IsString()
    phone: string

    @IsOptional()
    @IsString()
    birthday: string

    @IsOptional()
    @IsIn(["MALE", "FEMALE"])
    gender: GenderT

    @IsOptional()
    @IsString()
    avatar: string
}