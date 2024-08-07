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
import { LectionDto } from './dto/lection.dto';
import { LectionService } from './lection.service';

@Controller('lection')
export class LectionController {
  constructor(private readonly lectionService: LectionService) {}

  @Get()
  @Auth('ADMIN')
  getAll() {
    return this.lectionService.getAll();
  }

  @Get(':id')
  @Auth('ADMIN')
  getById(@Param('id') id: string) {
    return this.lectionService.getById(Number(id));
  }

  @Auth('STUDENT')
  @Get('/by-slug/:slug')
  getBySlug(@CurrentUser('id') id: string, @Param('slug') slug: string) {
    return this.lectionService.getBySlug(Number(id), slug);
  }

  @Post()
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  create(@Body() dto: LectionDto) {
    return this.lectionService.create(dto);
  }

  @Put(':id')
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  update(@Param('id') id: string, @Body() dto: LectionDto) {
    return this.lectionService.update(Number(id), dto);
  }

  @Delete(':id')
  @Auth('ADMIN')
  delete(@Param('id') id: string) {
    return this.lectionService.delete(Number(id));
  }
}
