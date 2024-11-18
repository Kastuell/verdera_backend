import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { CurrentUser } from 'src/decorators/user.decorator';
import { OrderDto } from './dto/order.dto';
import { PaymentStatusDto } from './dto/payment-status.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Auth()
  @UsePipes(new ValidationPipe())
  placeOrder(@Body() dto: OrderDto, @CurrentUser('id') userId: number) {
    return this.orderService.smartOrder(dto, userId);
  }

  @Post('status')
  @HttpCode(200)
  async updateStatus(@Body() dto: PaymentStatusDto) {
    return this.orderService.updateStatus(dto);
  }

  @Get('my-orders')
  @Auth()
  async getMyOrders(@CurrentUser('id') userId: number) {
    return this.orderService.getMyOrders(userId);
  }

  @Get('all')
  @Auth('ADMIN')
  async getAllOrders() {
    return this.orderService.getAllOrders();
  }
}
