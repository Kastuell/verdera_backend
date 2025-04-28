import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import translit from 'src/utils/generate-slug';
import { categoryDto } from './dto/category.dto';
import { returnCategoryObject } from './return-category.object';

@Injectable()
export class CategoryService {
    constructor(private prisma: PrismaService) { }

    async getAll() {
        const categories = await this.prisma.category.findMany({
            select: {
                ...returnCategoryObject
            }
        })

        if (!categories) throw new NotFoundException('Категории не найдены')

        return categories
    }

    async getById(id: number) {
        const category = await this.prisma.category.findUnique({
            where: {
                id: id
            },
            select: {
                ...returnCategoryObject
            }
        })

        if (!category) throw new NotFoundException(`Категория под номером "${id}" не найдена`)


        return category
    }

    async getBySlug(slug: string) {
        const category = await this.prisma.category.findUnique({
            where: {
                slug: slug
            },
            select: {
                ...returnCategoryObject
            }
        })

        if (!category) throw new NotFoundException(`Категория под значением "${slug}" не найдена`)


        return category
    }

    async create(dto: categoryDto) {

        const { name } = dto


        const category = await this.prisma.category.create({
            data: {
                name,
                slug: translit(name)
            }
        })

        return category
    }

    async update(id: number, dto: categoryDto) {
        const { name } = dto

        const category = await this.prisma.category.update({
            where: {
                id: id
            },
            data: {
                name,
                slug: translit(name)
            }
        })

        return category
    }

    async delete(id: number) {
        const category = await this.prisma.category.delete({
            where: {
                id: id
            }
        })

        return category
    }


    async createSimulator(dto: categoryDto) {

        const { name } = dto


        const category = await this.prisma.simulatorCategory.create({
            data: {
                name,
                slug: translit(name)
            }
        })

        return category
    }


}
