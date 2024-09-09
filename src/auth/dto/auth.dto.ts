import { IsEmail, IsString } from "class-validator"

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
    region: string

    @IsString()
    social: string

    @IsString()
    birthday: string
}

export class ChangePasswordDto {
    @IsEmail()
    email: string;
  
    @IsString()
    password: string;
  
    @IsString()
    confirmCode: string;
  }
  

export type RoleT = 'USER' |
    'STUDENT' |
    'TEACHER' |
    'ADMIN' 
