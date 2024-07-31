import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { ProductDto } from './dto/product.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  getAll() {
    return this.productService.getAll();
  }

  @Get(':id')
  @Auth('ADMIN')
  getById(@Param('id') id: string) {
    return this.productService.getById(Number(id));
  }

  @Get('/by-slug/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.productService.getBySlug(slug);
  }

  @Get('/by-category/:categorySlug')
  getByCategorySlug(@Param('categorySlug') categorySlug: string) {
    return this.productService.getByCategorySlug(categorySlug);
  }

  @Post()
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  create(@Body() dto: ProductDto) {
    return this.productService.create(dto);
  }

  @Put(':id')
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  update(@Param('id') id: string, @Body() dto: ProductDto) {
    return this.productService.update(Number(id), dto);
  }

  @Delete(':id')
  @Auth('ADMIN')
  delete(@Param('id') id: string) {
    return this.productService.delete(Number(id));
  }
}
