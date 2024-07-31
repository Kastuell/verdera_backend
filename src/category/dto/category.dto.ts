import { IsString } from "class-validator";

export class categoryDto {
    @IsString()
    name: string
}