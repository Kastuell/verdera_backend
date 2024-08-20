import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import translit from 'src/utils/generate-slug';
import { ProductDto } from './dto/product.dto';
import { returnProductObject } from './return-product.object';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const products = await this.prisma.product.findMany({
      select: {
        ...returnProductObject,
      },
    });

    if (!products) throw new NotFoundException(`Товары не найдены`);

    return products;
  }

  async getById(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        ...returnProductObject,
      },
    });

    if (!product)
      throw new NotFoundException(`Товар под номером ${productId} не найден`);

    return product;
  }

  async getBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        slug: slug,
      },
      select: {
        ...returnProductObject,
      },
    });

    if (!product)
      throw new NotFoundException(`Товар под значением ${slug} не найден`);

    return product;
  }

  async getByCategorySlug(categorySlug: string) {
    const products = await this.prisma.product.findMany({
      where: {
        category: {
          slug: categorySlug,
        },
      },
      select: {
        ...returnProductObject,
      },
    });

    if (!products)
      throw new NotFoundException(
        `Товары под значением "${categorySlug}" не найдены`,
      );

    return products;
  }

  async create(dto: ProductDto) {
    const { categoryId, name, subName, ...rest } = dto;

    const product = await this.prisma.product.create({
      data: {
        name,
        slug: translit(name),
        category: {
          connect: {
            id: categoryId,
          },
        },
        subName: subName ? subName : '',
        ...rest,
      },
    });

    return product;
  }

  async update(productId: number, dto: ProductDto) {
    const { categoryId, name, ...rest } = dto;

    const oldProduct = this.getById(productId);

    if (!oldProduct)
      throw new NotFoundException(`Товар под номером ${productId} не найден`);

    const product = await this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name,
        slug: translit(name),
        category: {
          connect: {
            id: categoryId,
          },
        },
        ...rest,
      },
    });

    return product;
  }

  async delete(productId: number) {
    const oldProduct = this.getById(productId);

    if (oldProduct)
      throw new NotFoundException(`Товар под номером ${productId} не найден`);

    const product = await this.prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return product;
  }
}
