import { Prisma } from "@prisma/client";
import { IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class ProductDto implements Prisma.ProductUpdateInput {
    @IsString()
    name: string

    @IsObject()
    description: any

    @IsOptional()
    @IsArray()
    img: string[]

    @IsNumber()
    price: number

    @IsBoolean()
    stock: boolean

    @IsOptional()
    @IsString()
    source: string

    @IsNumber()
    categoryId: number
}