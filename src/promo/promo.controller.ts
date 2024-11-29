import { Body, Controller, Param, Post } from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { PromoService } from './promo.service';

@Controller('promo')
export class PromoController {
  constructor(private readonly promoService: PromoService) {}

  @Post(':name')
  @Auth()
  getByName(@Param('name') name: string) {
    return this.promoService.getByName(name);
  }

  @Post("create")
  @Auth('ADMIN')
  create(@Body() dto: { name: string; value: number }) {
    return this.promoService.create(dto);
  }
}
