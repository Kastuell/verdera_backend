import { Prisma } from '@prisma/client';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UserDto implements Prisma.UserUpdateInput {
  @IsString()
  name: string;

  @IsString()
  surname: string;

  @IsString()
  family: string;

  @IsEmail()
  email: string;

  @IsString()
  birthday: string;

  @IsString()
  phone: string;

  @IsString()
  password: string;

  @IsString()
  avatar: string;
}

export class UserUpdateDto implements Prisma.UserUpdateInput {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  surname: string;

  @IsOptional()
  @IsString()
  family: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  avatar: string;
}
