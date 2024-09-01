import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { CurrentUser } from 'src/decorators/user.decorator';
import { SupportDto, SupportDtoUnAuth } from './dto/support.dto';
import { SupportService } from './support.service';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get()
  @Auth('ADMIN')
  async getAll() {
    return await this.supportService.getAll();
  }

  @Post()
  @Auth()
  @UsePipes(new ValidationPipe())
  async create(@Body() dto: SupportDto, @CurrentUser('id') userId: string) {
    return await this.supportService.create(dto, Number(userId));
  }

  @Post("/no-auth")
  @UsePipes(new ValidationPipe())
  async createUnAuth(@Body() dto: SupportDtoUnAuth) {
    return await this.supportService.createUnAuth(dto);
  }
}
