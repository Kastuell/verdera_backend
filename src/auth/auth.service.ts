import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EnumUserRoles } from '@prisma/client';
import { hash, verify } from 'argon2';
import { Response } from 'express';
import { PrismaService } from 'src/prisma.service';
import { returnUserObject } from 'src/user/return-user.object';
import { AuthLoginDto, AuthRegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  EXPIRE_DAYS_REFRESH_TOKEN = 30;
  EXPIRE_HOURS_ACCESS_TOKEN = 1;
  REFRESH_TOKEN_NAME = 'refreshToken';
  ACCESS_TOKEN_NAME = 'accessToken';

  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async login(dto: AuthLoginDto) {
    const { password, ...user } = await this.validateUser(dto);
    const tokens = this.issueTokens(user.id);

    return {
      user,
      ...tokens,
    };
  }

  async register(dto: AuthRegisterDto) {
    const { email } = dto;
    const oldUser = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (oldUser)
      throw new BadRequestException(
        'Пользователь с такой почтой уже существует',
      );

    const { password, ...rest } = dto;

    const user = await this.prisma.user.create({
      data: {
        password: await hash(password),
        avatar: '',
        role: EnumUserRoles.USER,
        active: true,
        ...rest,
      },
    });

    const tokens = this.issueTokens(user.id);

    return {
      user,
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

    if (!isValid) throw new UnauthorizedException('Invalid password');

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
      domain: 'localhost',
      expires: new Date(0),
      secure: true,
      // lax if production
      sameSite: 'none',
    });
    res.cookie(this.ACCESS_TOKEN_NAME, '', {
      httpOnly: true,
      domain: 'localhost',
      expires: new Date(0),
      secure: true,
      // lax if production
      sameSite: 'none',
    });
  }
}
