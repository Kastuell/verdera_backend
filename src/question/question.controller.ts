import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { QuestionDto } from './dto/question.dto';
import { QuestionService } from './question.service';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  @Auth('ADMIN')
  getAll() {
    return this.questionService.getAll();
  }

  @Auth('ADMIN')
  @Get('by-slug/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.questionService.getBySlug(slug);
  }

  @Auth('ADMIN')
  @Get('by-test-slug/:slug')
  getByTestSlug(@Param('slug') slug: string) {
    return this.questionService.getByTestSlug(slug);
  }

  @Get(':id')
  @Auth('ADMIN')
  getById(@Param('id') id: string) {
    return this.questionService.getById(Number(id));
  }

  @Post()
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  create(@Body() dto: QuestionDto) {
    return this.questionService.create(dto);
  }

  @Put(':id')
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  update(@Param('id') id: string, @Body() dto: QuestionDto) {
    return this.questionService.update(Number(id), dto);
  }

  @Delete(':id')
  @Auth('ADMIN')
  delete(@Param('id') id: string) {
    return this.questionService.delete(Number(id));
  }
}
