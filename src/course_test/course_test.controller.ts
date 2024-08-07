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
import { CourseTestService } from './course_test.service';
import { TestDto } from './dto/test.dto';

@Controller('course-test')
export class CourseTestController {
  constructor(private readonly courseTestService: CourseTestService) {}

  @Get()
  @Auth('ADMIN')
  getAll() {
    return this.courseTestService.getAll();
  }

  @Auth('ADMIN')
  @Get('by-slug/:slug')
  getByCourseSlug(@Param('slug') slug: string) {
    return this.courseTestService.getBySlug(slug);
  }

  @Get(':id')
  @Auth('ADMIN')
  getById(@Param('id') id: string) {
    return this.courseTestService.getById(Number(id));
  }

  @Post()
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  create(@Body() dto: TestDto) {
    return this.courseTestService.create(dto);
  }

  @Put(':id')
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  update(@Param('id') id: string, @Body() dto: TestDto) {
    return this.courseTestService.update(Number(id), dto);
  }

  @Delete(':id')
  @Auth('ADMIN')
  delete(@Param('id') id: string) {
    return this.courseTestService.delete(Number(id));
  }
}
