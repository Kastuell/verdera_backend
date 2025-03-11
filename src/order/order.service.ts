import { Injectable } from '@nestjs/common';
import { EnumOrderStatus } from '@prisma/client';
import { DiscountService } from 'src/discount/discount.service';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma.service';
import { PromoService } from 'src/promo/promo.service';
import { UserService } from 'src/user/user.service';
import * as YooKassa from 'yookassa';
import { OrderDto } from './dto/order.dto';
import { PaymentStatusDto } from './dto/payment-status.dto';
import { returnOrdersObject } from './return-order.object';

const yooKassa = new YooKassa({
  shopId: process.env['SHOP_ID'],
  secretKey: process.env['PAYMENT_TOKEN'],
});

const DISCOUNT_PERCANTAGE = 10;
const PROMO_PERCANTAGE = 30;

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private discountService: DiscountService,
    private promoService: PromoService,
    private emailService: EmailService,
  ) {}

  async getAllOrders() {
    const orders = await this.prisma.order.findMany({
      select: {
        ...returnOrdersObject,
        user: {
          select: {
            phone: true,
            email: true,
            name: true,
            family: true,
            surname: true,
            social: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    return orders;
  }

  async smartOrder(dto: OrderDto, userId: number) {
    const total = dto.items.reduce(
      (prev, cur) => prev + cur.price * cur.quantity,
      0,
    );

    const { email } = await this.userService.getById(userId);

    const discount = await this.discountService.getByEmail(email);

    const promo = await this.promoService.getByName(dto.info.promo);

    const total_disc = promo
      ? total * (1 - promo.value / 100)
      : discount
        ? total * (1 - DISCOUNT_PERCANTAGE / 100)
        : total;

    const order = await this.prisma.order.create({
      data: {
        status: dto.status,
        items: {
          create: dto.items,
        },
        user: {
          connect: {
            id: userId,
          },
        },
        info: dto.info,
        total: total_disc,
      },
    });

    const payment = await yooKassa.createPayment({
      amount: {
        value: total_disc.toFixed(2),
        currency: 'RUB',
      },
      // payment_method_data: {
      //   type: 'bank_card',
      // },
      confirmation: {
        type: 'redirect',
        return_url: process.env.FRONT_URL + '/thanks',
      },
      description: `Заказ #${order.id}`,
    });

    return payment;
  }

  async placeOrder(dto: OrderDto, userId: number) {
    const total = dto.items.reduce(
      (prev, cur) => prev + cur.price * cur.quantity,
      0,
    );

    const { email } = await this.userService.getById(userId);

    const discount = await this.discountService.getByEmail(email);

    const promo = await this.promoService.getByName(dto.info.promo);

    const total_disc = promo
      ? total * (1 - PROMO_PERCANTAGE / 100)
      : discount
        ? total * (1 - DISCOUNT_PERCANTAGE / 100)
        : total;

    //  Оформить рассрочку

    // Чтобы оформить рассрочку авторизуйтесь ниже, далее перейдите в каталог вбыерите товар, добавиьте в корзину, и нажмите оформить заказ.

    const order = await this.prisma.order.create({
      data: {
        status: dto.status,
        items: {
          create: dto.items,
        },
        user: {
          connect: {
            id: userId,
          },
        },
        info: dto.info,
        total: total_disc,
      },
    });

    const payment = await yooKassa.createPayment({
      amount: {
        value: total_disc.toFixed(2),
        currency: 'RUB',
      },
      payment_method_data: {
        type: 'bank_card',
      },
      confirmation: {
        type: 'redirect',
        return_url: process.env.FRONT_URL + '/thanks',
      },
      description: `Заказ #${order.id}`,
    });

    return payment;
  }

  async getMyOrders(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: {
        userId: userId,
      },
      select: {
        ...returnOrdersObject,
      },
    });

    return orders;
  }

  async updateStatus(dto: PaymentStatusDto) {
    if (dto.event === 'payment.waiting_for_capture') {
      const payment = await yooKassa.capturePayment(dto.object.id);
      return payment;
    }
    if (dto.event == 'payment.canceled') {
      const orderId = Number(dto.object.description.split('#')[1]);

      const order = await this.prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: EnumOrderStatus.CANCELED,
        },
      });
      return order;
    }

    if (dto.event == 'payment.succeeded') {
      const orderId = Number(dto.object.description.split('#')[1]);

      const order = await this.prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: EnumOrderStatus.PAYED,
        },
      });

      const user = await this.userService.getById(order.userId);

      const orderItemsWithCourses = await this.prisma.orderItem.findMany({
        where: {
          orderId: orderId,
          product: {
            category: {
              name: 'Курсы',
            },
          },
        },
      });

      orderItemsWithCourses.map(
        async (item) =>
          await this.prisma.boughtCourses.create({
            data: {
              user: {
                connect: {
                  id: order.userId,
                },
              },
              course: {
                connect: {
                  id: await this.prisma.course
                    .findUnique({
                      where: {
                        productId: item.productId,
                      },
                    })
                    .then((qwe) => qwe.id),
                },
              },
            },
          }),
      );

      if (user.role == 'USER') {
        await this.prisma.user.update({
          where: {
            id: order.userId,
          },
          data: {
            role: 'STUDENT',
          },
        });
      }

      await this.emailService.sendSuccedOrderEmail(order);
 
      return true;
    }
  }
}
