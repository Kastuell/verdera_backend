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
import { CurrentUser } from 'src/decorators/user.decorator';
import { CourseChapterService } from './course_chapter.service';
import { CourseChapterDto } from './dto/course_chapter.dto';

@Controller('course-chapter')
export class CourseChapterController {
  constructor(private readonly courseChapterService: CourseChapterService) {}

  @Get()
  @Auth('ADMIN')
  getAll() {
    return this.courseChapterService.getAll();
  }

  @Auth('STUDENT')
  @Get('course-slug/:courseSlug')
  getByCourseSlug(
    @Param('courseSlug') courseSlug: string,
    @CurrentUser('id') id: string,
  ) {
    return this.courseChapterService.getByCourseSlug(courseSlug, Number(id));
  }

  @Get(':id')
  @Auth('ADMIN')
  getById(@Param('id') id: string) {
    return this.courseChapterService.getById(Number(id));
  }

  @Post()
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  create(@Body() dto: CourseChapterDto) {
    return this.courseChapterService.create(dto);
  }

  @Put(':id')
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  update(@Param('id') id: string, @Body() dto: CourseChapterDto) {
    return this.courseChapterService.update(Number(id), dto);
  }

  @Delete(':id')
  @Auth('ADMIN')
  delete(@Param('id') id: string) {
    return this.courseChapterService.delete(Number(id));
  }
}
