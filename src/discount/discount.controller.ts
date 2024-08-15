import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { DiscountService } from './discount.service';
import { DiscountDto } from './dto/discount.dto';

@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  async create(@Body() dto: DiscountDto) {
    return await this.discountService.create(dto);
  }

  @Get()
  @Auth('ADMIN')
  async getAll() {
    return await this.discountService.getAll();
  }

  @Get('/:email')
  @Auth('ADMIN')
  async getByEmail(@Param('email') dto: DiscountDto) {
    return await this.discountService.getByEmail(dto);
  }
}
