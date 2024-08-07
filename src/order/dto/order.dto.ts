import { EnumOrderStatus } from '@prisma/client';
import {
    ArrayMinSize,
    IsEnum,
    IsNumber,
    IsObject,
    IsOptional
} from 'class-validator';

export class OrderDto {
  @IsOptional()
  @IsEnum(EnumOrderStatus)
  status: EnumOrderStatus;

  @ArrayMinSize(1)
  items: OrderItemDto[];

  @IsObject()
  info: object;

}

export class OrderItemDto {
  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsNumber()
  productId: number;
}
