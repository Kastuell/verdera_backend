import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma.service';
import { EmailDto } from './dto/send_email.dto';
import { ConfirmingLinkTemplate } from './templates/ConfirmingLinkTemplate';

@Injectable()
export class EmailService {
  constructor(private prisma: PrismaService) {}
  async sendEmail(dto: EmailDto) {
    const { to, code } = dto;

    console.log(dto);

    const link = `${process.env.FRONT_URL}/email/confirm?email=${to}&code=${code}`;

    const url = process.env.RUSENDER_EMAIL;
    const data = {
      mail: {
        to: {
          email: to,
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
        email: email,
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
          email: email,
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

  async sendChangePassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) throw new BadRequestException('User not found');

    const link = `${process.env.FRONT_URL}/email/change?code=${user.confirmCode}`;

    const url = process.env.RUSENDER_EMAIL;
  }
}
