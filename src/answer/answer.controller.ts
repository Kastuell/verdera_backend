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
import { AnswerService } from './answer.service';
import { AnswerDto, AnswerSmartDto } from './dto/answer.dto';

@Controller('answer')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Get()
  @Auth('ADMIN')
  getAll() {
    return this.answerService.getAll();
  }

  @Get(':id')
  @Auth('ADMIN')
  getById(@Param('id') id: string) {
    return this.answerService.getById(Number(id));
  }

  @Get('by-qustionid/:id')
  @Auth('ADMIN')
  getByQuestionId(@Param('id') id: string) {
    return this.answerService.getByQuestionId(Number(id));
  }

  @Post()
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  create(@Body() dto: AnswerDto) {
    return this.answerService.create(dto);
  }


  @Post("smart")
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  createSmart(@Body() dto: AnswerSmartDto) {
    return this.answerService.createSmart(dto);
  }

  @Put(':id')
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  update(@Param('id') id: string, @Body() dto: AnswerDto) {
    return this.answerService.update(Number(id), dto);
  }

  @Delete(':id')
  @Auth('ADMIN')
  delete(@Param('id') id: string) {
    return this.answerService.delete(Number(id));
  }
}
