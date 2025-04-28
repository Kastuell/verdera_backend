import { BadRequestException, Injectable } from '@nestjs/common';
import { Order } from '@prisma/client';
import axios from 'axios';
import { PrismaService } from 'src/prisma.service';
import { EmailDto } from './dto/send_email.dto';
import { ConfirmingLinkTemplate } from './templates/ConfirmingLinkTemplate';
import { DiscountTemplate } from './templates/DiscountTemplate';
import { OrderTemplate } from './templates/OrderTemplate';
import { RegisterTemplate } from './templates/RegisterTemplate';
import { resetPasswordTemplate } from './templates/resetPasswordTemplate';
import { SupportTemplate } from './templates/SupportTemplate';

@Injectable()
export class EmailService {
  constructor(private prisma: PrismaService) {}

  async sendDiscountEmail(discount: { id: number; email: string }) {
    const url = process.env.RUSENDER_EMAIL;
    const data = {
      mail: {
        to: {
          email: `${process.env.SUPPORT_EMAIL}`,
          name: 'string',
        },
        from: {
          email: 'no-reply@verdera.ru',
          name: 'Verdera',
        },
        subject: `Рассылка №${discount.id}`,
        previewTitle: `Рассылка №${discount.id}`,
        html: DiscountTemplate({ discount }),
      },
    };

    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.RUSENDER_KEY,
    };
    axios
      .post(url, data, { headers })
      .then((response) => {
        // console.log(response);
        // Обработка ответа API
      })
      .catch((error) => {
        // Обработка ошибки
        console.log(error);
      });

    return data;
  }

  async sendSuccedOrderEmail(order: Order) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: order.userId
      }
    })
    const url = process.env.RUSENDER_EMAIL;
    const data = {
      mail: {
        to: {
          email: `${process.env.SUPPORT_EMAIL}`,
          name: 'string',
        },
        from: {
          email: 'no-reply@verdera.ru',
          name: 'Verdera',
        },
        subject: `Заказ №${order.id}`,
        previewTitle: `Заказ №${order.id}`,
        html: OrderTemplate({ order, user }),
      },
    };

    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.RUSENDER_KEY,
    };
    axios
      .post(url, data, { headers })
      .then((response) => {
        // console.log(response);
        // Обработка ответа API
      })
      .catch((error) => {
        // Обработка ошибки
        console.log(error);
      });

    return data;
  }

  async sendSupportEmail(support: {
    id?: number;
    createdAt?: Date;
    name?: string;
    phone?: string;
    messenger?: string;
    description?: string;
    userId?: number | null;
  }) {
    const url = process.env.RUSENDER_EMAIL;
    const data = {
      mail: {
        to: {
          email: `${process.env.SUPPORT_EMAIL}`,
          name: 'string',
        },
        from: {
          email: 'no-reply@verdera.ru',
          name: 'Verdera',
        },
        subject: `Обращение в поддержку №${support.id}`,
        previewTitle: `Обращение в поддержку №${support.id}`,
        html: SupportTemplate({ support }),
      },
    };

    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.RUSENDER_KEY,
    };
    axios
      .post(url, data, { headers })
      .then((response) => {
        // console.log(response);
        // Обработка ответа API
      })
      .catch((error) => {
        // Обработка ошибки
        console.log(error);
      });

    return data;
  }

  async sendEmail(dto: EmailDto) {
    const { to, code } = dto;

    console.log(dto);

    const link = `${process.env.FRONT_URL}/email/confirm?email=${to}&code=${code}`;

    const url = process.env.RUSENDER_EMAIL;
    const data = {
      mail: {
        to: {
          email: to.toLowerCase(),
          name: 'string',
        },
        from: {
          email: 'no-reply@verdera.ru',
          name: 'Verdera',
        },
        subject: 'Подтверждение регистрации',
        previewTitle: 'Подтверждение регистрации',
        html: ConfirmingLinkTemplate({ link: link }),
      },
    };

    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.RUSENDER_KEY,
    };
    axios
      .post(url, data, { headers })
      .then((response) => {
        // console.log(response);
        // Обработка ответа API
      })
      .catch((error) => {
        // Обработка ошибки
        console.log(error);
      });

    return data;
  }

  async resendConfirm(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user) throw new BadRequestException('User not found');

    if (user.isEmailConfirmed)
      throw new BadRequestException('Почта уже активирована');

    if (!user.confirmCode)
      throw new BadRequestException('Нет кода подтверждения');

    const link = `${process.env.EMAIL_CONFIRM_LINK}?email=${email}&code=${user.confirmCode}`;

    const url = process.env.RUSENDER_EMAIL;
    const data = {
      mail: {
        to: {
          email: email.toLowerCase(),
          name: user.name,
        },
        from: {
          email: 'no-reply@verdera.ru',
          name: 'Verdera',
        },
        subject: 'Подтверждение регистрации',
        previewTitle: 'Подтверждение регистрации',
        html: ConfirmingLinkTemplate({ link: link }),
      },
    };

    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.RUSENDER_KEY,
    };
    axios
      .post(url, data, { headers })
      .then((response) => {
        // console.log(response);
        // Обработка ответа API
      })
      .catch((error) => {
        // Обработка ошибки
        console.log(error);
      });

    return data;
  }

  async sendResetPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user) throw new BadRequestException('User not found');

    const link = `${process.env.FRONT_URL}/email/reset?code=${user.confirmCode}&email=${email}`;

    const url = process.env.RUSENDER_EMAIL;

    const data = {
      mail: {
        to: {
          email: email.toLowerCase(),
          name: user.name,
        },
        from: {
          email: 'no-reply@verdera.ru',
          name: 'Verdera',
        },
        subject: 'Смена пароля',
        previewTitle: 'Смена пароля',
        html: resetPasswordTemplate({ link: link }),
      },
    };

    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.RUSENDER_KEY,
    };
    axios
      .post(url, data, { headers })
      .then((response) => {
        // console.log(response);
        // Обработка ответа API
      })
      .catch((error) => {
        // Обработка ошибки
        console.log(error);
      });

    return data;
  }
  async sendRegister(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id
      }
    })
    const url = process.env.RUSENDER_EMAIL;
    const data = {
      mail: {
        to: {
          email: `${process.env.SUPPORT_EMAIL}`,
          name: 'string',
        },
        from: {
          email: 'no-reply@verdera.ru',
          name: 'Verdera',
        },
        subject: `Пользователь №${user.id}`,
        previewTitle: `Пользователь №${user.id}`,
        html: RegisterTemplate({user}),
      },
    };

    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.RUSENDER_KEY,
    };
    axios
      .post(url, data, { headers })
      .then((response) => {
        // console.log(response);
        // Обработка ответа API
      })
      .catch((error) => {
        // Обработка ошибки
        console.log(error);
      });

    return data;
}
}
