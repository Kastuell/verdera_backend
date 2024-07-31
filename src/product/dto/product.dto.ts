import { Prisma } from "@prisma/client";
import { IsBoolean, IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class ProductDto implements Prisma.ProductUpdateInput {
    @IsString()
    name: string

    @IsString()
    @IsOptional()
    subName: string

    @IsString()
    img: string

    @IsNumber()
    price: number

    @IsBoolean()
    stock: boolean

    @IsObject()
    @IsOptional()
    description: DescriptionT

    @IsNumber()
    categoryId: number
}


type DescriptionT = {
    firstly: string
    about: DescriptionAboutT
    structure: DescriptionStructureT
}

type DescriptionStructureT = {
    title: string,
    items: {
        description: string
        quantity?: number
    }[]
}

type DescriptionAboutT = {
    title: string
    img: string
    items: ItemsT[]
}

type ItemsT = {
    title: string
    description: string
}
