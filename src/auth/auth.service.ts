import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EnumUserRoles } from '@prisma/client';
import { hash, verify } from 'argon2';
import { Response } from 'express';
import { EmailDto } from 'src/email/dto/send_email.dto';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma.service';
import { returnUserObject } from 'src/user/return-user.object';
import { v4 as uuidv4 } from 'uuid';
import {
  AuthLoginDto,
  AuthRegisterDto,
  ResetPasswordDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  EXPIRE_DAYS_REFRESH_TOKEN = 30;
  EXPIRE_HOURS_ACCESS_TOKEN = 24 * 7;
  REFRESH_TOKEN_NAME = 'refreshToken';
  ACCESS_TOKEN_NAME = 'accessToken';

  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async login(dto: AuthLoginDto) {
    const { password, ...user } = await this.validateUser(dto);
    const tokens = this.issueTokens(user.id);

    if (!user.isEmailConfirmed) {
      throw new BadRequestException(
        'Ваша учётная запись неактивирована, откройте почту для подтверждения',
      );
    }

    return {
      user,
      ...tokens,
    };
  }

  async getUserByEmail(email: string) {
    if (email === undefined)
      throw new BadRequestException('Предоставьте почту');
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        isEmailConfirmed: true,
        confirmCode: true,
      },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    return user;
  }

  async emailConfirm(dto: EmailDto) {
    const { code, to } = dto;
    const user = await this.getUserByEmail(to);
    if (!user) throw new NotFoundException();
    else {
      if (!user.isEmailConfirmed) {
        if (code == user.confirmCode) {
          const updated_user = await this.prisma.user.update({
            where: {
              email: to,
            },
            data: {
              isEmailConfirmed: true,
            },
          });

          const tokens = this.issueTokens(user.id);
          return {
            user,
            ...tokens,
          };
        } else {
          throw new BadRequestException('Коды не совпадают');
        }
      } else {
        throw new BadRequestException('Почта уже активирована');
      }
    }
  }

  async register(dto: AuthRegisterDto) {
    const { email, phone } = dto;
    const oldUser = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    const oldUser2 = await this.prisma.user.findUnique({
      where: {
        phone: phone,
      },
    });

    if (oldUser)
      throw new BadRequestException(
        'Пользователь с такой почтой уже существует',
      );

    if (oldUser2)
      throw new BadRequestException(
        'Пользователь с таким телефоном уже существует',
      );

    const { password, ...rest } = dto;

    const user = await this.prisma.user.create({
      data: {
        password: await hash(password),
        role: EnumUserRoles.USER,
        active: true,
        confirmCode: uuidv4(),
        ...rest,
      },
    });

    await this.emailService.sendEmail({
      to: 'sholotun@mail.ru',
      code: user.confirmCode,
    });

    // const tokens = this.issueTokens(user.id);

    return {
      user,
      // ...tokens,
    };
  }

  async resetPassword(
    dto: ResetPasswordDto,
    query: {
      code: string;
      email: string;
    },
  ) {
    const { password } = dto;

    const user = await this.getUserByEmail(query.email);

    if (!user) throw new NotFoundException('Пользователя с такой почтой нет');

    if (user.confirmCode !== query.code) {
      throw new BadRequestException('Коды не совпадают');
    }

    const new_user = await this.prisma.user.update({
      where: {
        email: query.email,
      },
      data: {
        password: await hash(password),
      },
    });

    const tokens = this.issueTokens(user.id);

    return {
      new_user,
      ...tokens,
    };
  }

  async getByAccessToken(accessToken: string) {
    const { id } = await this.jwt.verifyAsync(accessToken);

    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        role: true,
      },
    });
    return user;
  }

  async getNewTokens(refreshToken: string) {
    const result = await this.jwt.verifyAsync(refreshToken);
    if (!result) throw new UnauthorizedException('Invalid refresh token');

    const { password, ...user } = await this.prisma.user.findUnique({
      where: {
        id: result.id,
      },
      select: {
        ...returnUserObject,
      },
    });

    const tokens = this.issueTokens(user.id);

    return {
      user,
      ...tokens,
    };
  }

  private issueTokens(userId: number) {
    const data = { id: userId };

    const accessToken = this.jwt.sign(data, {
      expiresIn: '1h',
    });

    const refreshToken = this.jwt.sign(data, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private async validateUser(dto: AuthLoginDto) {
    const { email } = dto;
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user)
      throw new BadRequestException('Пользователя с такой почтой нет!');

    const isValid = await verify(user.password, dto.password);

    if (!isValid) throw new UnauthorizedException('Неверный пароль!');

    return user;
  }

  addTokensToResponse(
    res: Response,
    refreshToken: string,
    accessToken: string,
  ) {
    const expiresInRefresh = new Date();
    expiresInRefresh.setDate(
      expiresInRefresh.getDate() + this.EXPIRE_DAYS_REFRESH_TOKEN,
    );

    const expiresInAccess = new Date();
    expiresInAccess.setHours(
      expiresInRefresh.getHours() + this.EXPIRE_HOURS_ACCESS_TOKEN,
    );

    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain: process.env.DOMAIN,
      expires: expiresInRefresh,
      secure: true,
      // lax if production
      sameSite: 'none',
    });
    res.cookie(this.ACCESS_TOKEN_NAME, accessToken, {
      httpOnly: true,
      domain: process.env.DOMAIN,
      expires: expiresInAccess,
      secure: true,
      // lax if production
      sameSite: 'none',
    });
  }

  removeTokensFromResponse(res: Response) {
    res.cookie(this.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      domain: process.env.DOMAIN,
      expires: new Date(0),
      secure: true,
      // lax if production
      sameSite: 'none',
    });
    res.cookie(this.ACCESS_TOKEN_NAME, '', {
      httpOnly: true,
      domain: process.env.DOMAIN,
      expires: new Date(0),
      secure: true,
      // lax if production
      sameSite: 'none',
    });
  }
}
