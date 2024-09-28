import { IsEmail, IsString } from 'class-validator';

export class EmailDto {
  @IsEmail()
  to: string;

  @IsString()
  code: string;
}
