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
import { CourseService } from './course.service';
import { CourseDto } from './dto/course.dto';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @Auth('ADMIN')
  getAll() {
    return this.courseService.getAll();
  }

  @Get(':id')
  @Auth('ADMIN')
  getById(@Param('id') id: string) {
    return this.courseService.getById(Number(id));
  }

  @Auth('ADMIN')
  @Get('/by-slug/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.courseService.getBySlug(slug);
  }

  @Post()
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  create(@Body() dto: CourseDto) {
    return this.courseService.create(dto);
  }

  @Put(':id')
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  update(@Param('id') id: string, @Body() dto: CourseDto) {
    return this.courseService.update(Number(id), dto);
  }

  @Delete(':id')
  @Auth('ADMIN')
  delete(@Param('id') id: string) {
    return this.courseService.delete(Number(id));
  }
}
