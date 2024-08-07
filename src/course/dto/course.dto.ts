import { Prisma } from '@prisma/client';
import { IsNumber, IsObject, IsString } from 'class-validator';

export class CourseDto implements Prisma.CourseUpdateInput {
  @IsString()
  name: string;

  @IsObject()
  description: DescriptionT;

  @IsNumber()
  productId: number;

  @IsString()
  img: string;
}

type DescriptionT = {
  includes: DescriptionItemsT;
  features: DescriptionItemsT;
  after: DescriptionItemsT;
  pluses: string[];
};

type DescriptionItemsT = {
  title: string;
  items: string[];
};
