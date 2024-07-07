import { IsEmail, IsIn, IsString } from "class-validator"

export class AuthLoginDto {
    @IsEmail()
    email: string

    @IsString()
    password: string
}

export class AuthRegisterDto extends AuthLoginDto {
    @IsString()
    name: string

    @IsString()
    surname: string

    @IsString()
    family: string

    @IsString()
    phone: string

    @IsString()
    birthday: string

    @IsIn(["MALE", "FEMALE"])
    gender: GenderT
}

export type GenderT = "MALE" | "FEMALE"

export type RoleT = 'USER' |
    'STUDENT' |
    'TEACHER' |
    'ADMIN' 
