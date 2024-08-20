import { IsString } from 'class-validator';

export class LocalFileDto {
  @IsString()
  filename: string;

  @IsString()
  path: string;

  @IsString()
  mimetype: string;
}
