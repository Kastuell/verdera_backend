import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Auth } from 'src/decorators/auth.decorator';
import { AuthService } from './auth.service';
import { AuthLoginDto, AuthRegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() dto: AuthLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, accessToken, ...response } =
      await this.authService.login(dto);
    const user = await this.authService.getUserByEmail(response.user.email);

    if (user.isEmailConfirmed) {
      this.authService.addTokensToResponse(res, refreshToken, accessToken);

      return response;
    } else
      throw new BadRequestException(
        'Ваша учётная запись неактивирована, откройте почту для подтверждения',
      );
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('register')
  async register(
    @Body() dto: AuthRegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { ...response } = await this.authService.register(dto);
    // this.authService.addTokensToResponse(res, refreshToken, accessToken);

    return response;
  }

  @Post('email-confirm/:email')
  async emailConfirm(
    @Param('email') email: string,
    @Query()
    query: {
      code: string;
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    const code = query.code;
    const { refreshToken, accessToken, ...response } =
      await this.authService.emailConfirm({ to: email, code });
    this.authService.addTokensToResponse(res, refreshToken, accessToken);

    return response;
  }

  @HttpCode(200)
  @Post('login/access-token')
  async getNewTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshTokenFromCookies =
      req.cookies[this.authService.REFRESH_TOKEN_NAME];

    if (!refreshTokenFromCookies) {
      this.authService.removeTokensFromResponse(res);
      throw new UnauthorizedException('Refresh token not passed');
    }

    const { refreshToken, accessToken, ...response } =
      await this.authService.getNewTokens(refreshTokenFromCookies);

    this.authService.addTokensToResponse(res, refreshToken, accessToken);

    return response;
  }

  @Auth()
  @Get('by-accesstoken')
  async getByAccessToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessTokenFromCookies =
      req.cookies[this.authService.ACCESS_TOKEN_NAME];

    if (!accessTokenFromCookies) {
      this.authService.removeTokensFromResponse(res);
      throw new UnauthorizedException('Access token not passed');
    }

    return this.authService.getByAccessToken(accessTokenFromCookies);
  }

  @HttpCode(200)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    this.authService.removeTokensFromResponse(res);
    return true;
  }
}
