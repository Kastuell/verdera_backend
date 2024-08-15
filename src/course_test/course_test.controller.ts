import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { CurrentUser } from 'src/decorators/user.decorator';
import { CourseTestService } from './course_test.service';
import { CheckTestDto, TestDto } from './dto/test.dto';

@Controller('course-test')
export class CourseTestController {
  constructor(private readonly courseTestService: CourseTestService) {}

  @Get()
  @Auth('ADMIN')
  getAll() {
    return this.courseTestService.getAll();
  }

  @Auth('STUDENT')
  @Get('by-slug/:slug')
  getBySlug(
    @Param('slug') slug: string,
    @Query() query: string,
    @CurrentUser('id') id: string,
  ) {
    return this.courseTestService.getBySlug(slug, query, Number(id));
  }

  @Get(':id')
  @Auth('ADMIN')
  getById(@Param('id') id: string) {
    return this.courseTestService.getById(Number(id));
  }

  @Auth('STUDENT')
  @Post('check-test')
  @UsePipes(new ValidationPipe())
  async checkTest(@CurrentUser('id') id: string, @Body() dto: CheckTestDto) {
    return this.courseTestService.checkTest(dto, Number(id));
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
