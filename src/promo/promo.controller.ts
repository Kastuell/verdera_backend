import { Controller, Param, Post } from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { PromoService } from './promo.service';

@Controller('promo')
export class PromoController {
  constructor(private readonly promoService: PromoService) {}

  @Post('get/:name')
  @Auth()
  getByName(@Param('name') name: string) {
    return this.promoService.getByName(name);
  }

  @Post(':name')
  @Auth('ADMIN')
  create(@Param('name') name: string) {
    return this.promoService.create(name);
  }
}
