import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { CategoryService } from './category.service';
import { categoryDto } from './dto/category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Get()
  getAll() {
    return this.categoryService.getAll()
  }

  @Get(':id')
  @Auth('ADMIN')
  getById(@Param('id') id: string) {
    return this.categoryService.getById(Number(id))
  }

  @Get('/by-slug/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.categoryService.getBySlug(slug)
  }

  @Post()
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  create(@Body() dto: categoryDto) {
    return this.categoryService.create(dto)
  }

  @Post('/create-simulator')
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  createSimulator(@Body() dto: categoryDto) {
    return this.categoryService.createSimulator(dto)
  }

  @Put(':id')
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  update(@Param('id') id: string, @Body() dto: categoryDto) {
    return this.categoryService.update(Number(id), dto)
  }

  @Delete(':id')
  @Auth('ADMIN')
  delete(@Param('id') id: string) {
    return this.categoryService.delete(Number(id))
  }
}
