import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { CurrentUser } from 'src/decorators/user.decorator';
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
  async getByEmail(@Param('email') email: string) {
    return await this.discountService.getByEmail(email);
  }

  @Get('/get/my-discount')
  @Auth()
  async getMyDiscount(@CurrentUser('email') email: string) {
    return await this.discountService.getMyDiscount(email);
  }
}
